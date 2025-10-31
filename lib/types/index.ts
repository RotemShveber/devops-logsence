export enum LogSource {
  KUBERNETES = 'kubernetes',
  DOCKER = 'docker',
  JENKINS = 'jenkins',
  EC2 = 'ec2',
}

export enum LogCategory {
  NETWORK = 'network',
  PERMISSIONS = 'permissions',
  RESOURCE = 'resource',
  CONFIG = 'config',
  APPLICATION = 'application',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  UNKNOWN = 'unknown',
}

export enum LogSeverity {
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface RawLog {
  id: string;
  source: LogSource;
  timestamp: Date;
  message: string;
  metadata?: Record<string, any>;
  rawData: string;
}

export interface AnalyzedLog extends RawLog {
  category: LogCategory;
  severity: LogSeverity;
  errorType?: string;
  suggestedFix?: string;
  relatedLogs?: string[];
  tags: string[];
}

export interface LogAnalysis {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  categorySummary: Record<LogCategory, number>;
  sourceSummary: Record<LogSource, number>;
  recentErrors: AnalyzedLog[];
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface CollectorConfig {
  enabled: boolean;
  credentials?: Record<string, string>;
  endpoint?: string;
  pollInterval?: number;
}

export interface SystemConfig {
  collectors: {
    kubernetes?: CollectorConfig;
    docker?: CollectorConfig;
    jenkins?: CollectorConfig;
    ec2?: CollectorConfig;
  };
  analysis: {
    autoAnalyze: boolean;
    retentionDays: number;
  };
}

