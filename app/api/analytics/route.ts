import { NextRequest, NextResponse } from 'next/server';
import { AnalyzedLog, LogCategory, LogSeverity, LogSource } from '@/lib/types';

// This would come from your database in production
// For now, we'll import from the logs route cache
import '../logs/route';

export async function GET(request: NextRequest) {
  try {
    // Fetch logs from the API
    const response = await fetch(`${request.nextUrl.origin}/api/logs?limit=1000`);
    const data = await response.json();
    const logs: AnalyzedLog[] = data.logs || [];

    // Calculate analytics
    const totalLogs = logs.length;
    const errorCount = logs.filter(
      log => log.severity === LogSeverity.ERROR || log.severity === LogSeverity.CRITICAL
    ).length;
    const warningCount = logs.filter(log => log.severity === LogSeverity.WARNING).length;

    // Category summary
    const categorySummary: Record<LogCategory, number> = {
      [LogCategory.NETWORK]: 0,
      [LogCategory.PERMISSIONS]: 0,
      [LogCategory.RESOURCE]: 0,
      [LogCategory.CONFIG]: 0,
      [LogCategory.APPLICATION]: 0,
      [LogCategory.SECURITY]: 0,
      [LogCategory.PERFORMANCE]: 0,
      [LogCategory.UNKNOWN]: 0,
    };

    // Source summary
    const sourceSummary: Record<LogSource, number> = {
      [LogSource.KUBERNETES]: 0,
      [LogSource.DOCKER]: 0,
      [LogSource.JENKINS]: 0,
      [LogSource.EC2]: 0,
    };

    logs.forEach(log => {
      categorySummary[log.category]++;
      sourceSummary[log.source]++;
    });

    // Recent errors (last 20)
    const recentErrors = logs
      .filter(log => log.severity === LogSeverity.ERROR || log.severity === LogSeverity.CRITICAL)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    // Time range
    const timestamps = logs.map(log => new Date(log.timestamp).getTime());
    const timeRange = {
      start: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : new Date(),
      end: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date(),
    };

    // Error trends by hour
    const errorsByHour: Record<string, number> = {};
    logs
      .filter(log => log.severity === LogSeverity.ERROR || log.severity === LogSeverity.CRITICAL)
      .forEach(log => {
        const hour = new Date(log.timestamp).toISOString().slice(0, 13);
        errorsByHour[hour] = (errorsByHour[hour] || 0) + 1;
      });

    // Top error types
    const errorTypes: Record<string, number> = {};
    logs
      .filter(log => log.errorType)
      .forEach(log => {
        errorTypes[log.errorType!] = (errorTypes[log.errorType!] || 0) + 1;
      });

    const topErrorTypes = Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    return NextResponse.json({
      totalLogs,
      errorCount,
      warningCount,
      categorySummary,
      sourceSummary,
      recentErrors,
      timeRange,
      errorsByHour,
      topErrorTypes,
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}

