import { RawLog, AnalyzedLog, LogCategory, LogSeverity } from '@/lib/types';

interface ErrorPattern {
  pattern: RegExp;
  category: LogCategory;
  severity: LogSeverity;
  keywords: string[];
  suggestedFix?: string;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // Network errors
  {
    pattern: /connection (refused|timeout|reset|failed)|network (unreachable|timeout)|DNS resolution failed|ECONNREFUSED|socket hang up/i,
    category: LogCategory.NETWORK,
    severity: LogSeverity.ERROR,
    keywords: ['connection', 'network', 'timeout', 'dns'],
    suggestedFix: 'Check network connectivity, firewall rules, and DNS configuration',
  },
  {
    pattern: /cannot reach|host unreachable|no route to host/i,
    category: LogCategory.NETWORK,
    severity: LogSeverity.CRITICAL,
    keywords: ['unreachable', 'route'],
    suggestedFix: 'Verify network routes and host availability',
  },
  
  // Permission errors
  {
    pattern: /permission denied|access denied|unauthorized|forbidden|EACCES|401|403/i,
    category: LogCategory.PERMISSIONS,
    severity: LogSeverity.ERROR,
    keywords: ['permission', 'access', 'unauthorized', 'forbidden'],
    suggestedFix: 'Check user permissions, file ownership, and access policies',
  },
  {
    pattern: /insufficient privileges|not authorized|authentication failed/i,
    category: LogCategory.PERMISSIONS,
    severity: LogSeverity.ERROR,
    keywords: ['privileges', 'authentication'],
    suggestedFix: 'Verify authentication credentials and user roles',
  },
  
  // Resource errors
  {
    pattern: /out of memory|OOM|memory limit exceeded|cannot allocate memory/i,
    category: LogCategory.RESOURCE,
    severity: LogSeverity.CRITICAL,
    keywords: ['memory', 'oom'],
    suggestedFix: 'Increase memory limits or optimize memory usage',
  },
  {
    pattern: /disk (full|space)|no space left|quota exceeded|ENOSPC/i,
    category: LogCategory.RESOURCE,
    severity: LogSeverity.CRITICAL,
    keywords: ['disk', 'space', 'quota'],
    suggestedFix: 'Free up disk space or increase storage capacity',
  },
  {
    pattern: /cpu (throttling|limit)|max (cpu|processors)|too many processes/i,
    category: LogCategory.RESOURCE,
    severity: LogSeverity.WARNING,
    keywords: ['cpu', 'throttling', 'processes'],
    suggestedFix: 'Optimize CPU usage or increase CPU limits',
  },
  
  // Configuration errors
  {
    pattern: /invalid configuration|config (error|invalid)|misconfigured|configuration missing/i,
    category: LogCategory.CONFIG,
    severity: LogSeverity.ERROR,
    keywords: ['configuration', 'config', 'misconfigured'],
    suggestedFix: 'Review and correct configuration files',
  },
  {
    pattern: /environment variable.*not (set|found)|missing (env|environment)/i,
    category: LogCategory.CONFIG,
    severity: LogSeverity.ERROR,
    keywords: ['environment', 'variable', 'env'],
    suggestedFix: 'Set required environment variables',
  },
  {
    pattern: /port already in use|address already in use|EADDRINUSE/i,
    category: LogCategory.CONFIG,
    severity: LogSeverity.ERROR,
    keywords: ['port', 'address'],
    suggestedFix: 'Change port or stop conflicting service',
  },
  
  // Security errors
  {
    pattern: /certificate (invalid|expired)|TLS|SSL (error|handshake failed)|x509/i,
    category: LogCategory.SECURITY,
    severity: LogSeverity.ERROR,
    keywords: ['certificate', 'ssl', 'tls'],
    suggestedFix: 'Update or renew SSL/TLS certificates',
  },
  {
    pattern: /security violation|breach detected|malicious activity/i,
    category: LogCategory.SECURITY,
    severity: LogSeverity.CRITICAL,
    keywords: ['security', 'breach', 'malicious'],
    suggestedFix: 'Investigate security incident and apply patches',
  },
  
  // Performance errors
  {
    pattern: /slow (query|response)|performance degradation|high latency|timeout exceeded/i,
    category: LogCategory.PERFORMANCE,
    severity: LogSeverity.WARNING,
    keywords: ['slow', 'latency', 'performance'],
    suggestedFix: 'Optimize queries and check system resources',
  },
  {
    pattern: /deadlock|thread blocked|lock timeout/i,
    category: LogCategory.PERFORMANCE,
    severity: LogSeverity.ERROR,
    keywords: ['deadlock', 'blocked', 'lock'],
    suggestedFix: 'Review locking mechanisms and optimize concurrency',
  },
];

export class LogAnalyzer {
  private static extractErrorType(message: string): string | undefined {
    // Extract common error types
    const errorTypePatterns = [
      /Error:\s*([A-Za-z]+Error)/,
      /Exception:\s*([A-Za-z]+Exception)/,
      /([A-Z][a-z]+(?:[A-Z][a-z]+)*(?:Error|Exception))/,
    ];

    for (const pattern of errorTypePatterns) {
      const match = message.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }

  private static extractTags(message: string): string[] {
    const tags: Set<string> = new Set();
    
    // Extract service names
    const serviceMatch = message.match(/service[:\s]+([a-z0-9-]+)/i);
    if (serviceMatch) tags.add(serviceMatch[1]);
    
    // Extract pod/container names
    const podMatch = message.match(/pod[:\s]+([a-z0-9-]+)/i);
    if (podMatch) tags.add(podMatch[1]);
    
    // Extract namespace
    const namespaceMatch = message.match(/namespace[:\s]+([a-z0-9-]+)/i);
    if (namespaceMatch) tags.add(namespaceMatch[1]);
    
    // Extract status codes
    const statusMatch = message.match(/\b([45]\d{2})\b/);
    if (statusMatch) tags.add(`status-${statusMatch[1]}`);
    
    return Array.from(tags);
  }

  private static determineSeverity(message: string): LogSeverity {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('critical') || lowerMessage.includes('fatal')) {
      return LogSeverity.CRITICAL;
    }
    if (lowerMessage.includes('error') || lowerMessage.includes('fail')) {
      return LogSeverity.ERROR;
    }
    if (lowerMessage.includes('warn')) {
      return LogSeverity.WARNING;
    }
    if (lowerMessage.includes('debug')) {
      return LogSeverity.DEBUG;
    }
    
    return LogSeverity.INFO;
  }

  public static analyze(rawLog: RawLog): AnalyzedLog {
    let category = LogCategory.UNKNOWN;
    let severity = this.determineSeverity(rawLog.message);
    let suggestedFix: string | undefined;

    // Check against error patterns
    for (const errorPattern of ERROR_PATTERNS) {
      if (errorPattern.pattern.test(rawLog.message)) {
        category = errorPattern.category;
        severity = errorPattern.severity;
        suggestedFix = errorPattern.suggestedFix;
        break;
      }
    }

    // If still unknown but has error/exception keywords, mark as application error
    if (category === LogCategory.UNKNOWN && severity === LogSeverity.ERROR) {
      category = LogCategory.APPLICATION;
    }

    const errorType = this.extractErrorType(rawLog.message);
    const tags = this.extractTags(rawLog.message);

    return {
      ...rawLog,
      category,
      severity,
      errorType,
      suggestedFix,
      tags,
    };
  }

  public static analyzeBatch(rawLogs: RawLog[]): AnalyzedLog[] {
    return rawLogs.map(log => this.analyze(log));
  }

  public static categorizeByPattern(logs: AnalyzedLog[]): Map<string, AnalyzedLog[]> {
    const patterns = new Map<string, AnalyzedLog[]>();
    
    for (const log of logs) {
      const key = `${log.category}-${log.errorType || 'general'}`;
      if (!patterns.has(key)) {
        patterns.set(key, []);
      }
      patterns.get(key)!.push(log);
    }
    
    return patterns;
  }
}

