import { NextRequest, NextResponse } from 'next/server';
import { LogAnalyzer } from '@/lib/analyzers/logAnalyzer';
import { KubernetesCollector } from '@/lib/collectors/kubernetesCollector';
import { DockerCollector } from '@/lib/collectors/dockerCollector';
import { JenkinsCollector } from '@/lib/collectors/jenkinsCollector';
import { EC2Collector } from '@/lib/collectors/ec2Collector';
import { LogSource, RawLog } from '@/lib/types';
import { logsStore } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get('source');
  const category = searchParams.get('category');
  const severity = searchParams.get('severity');
  const limit = parseInt(searchParams.get('limit') || '1000');

  let filteredLogs = logsStore.getAll();

  // Apply filters
  if (source) {
    filteredLogs = filteredLogs.filter(log => log.source === source);
  }
  if (category) {
    filteredLogs = filteredLogs.filter(log => log.category === category);
  }
  if (severity) {
    filteredLogs = filteredLogs.filter(log => log.severity === severity);
  }

  // Sort by timestamp (most recent first)
  filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return NextResponse.json({
    logs: filteredLogs.slice(0, limit),
    total: filteredLogs.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, config } = body;

    let rawLogs: RawLog[] = [];

    switch (source) {
      case LogSource.KUBERNETES:
        try {
          const k8sCollector = new KubernetesCollector(config?.kubeConfigPath);
          rawLogs = await k8sCollector.getAllPodsLogs(config?.namespace || 'default');
        } catch (error) {
          console.error('Kubernetes collection error:', error);
          return NextResponse.json(
            { error: 'Failed to collect Kubernetes logs' },
            { status: 500 }
          );
        }
        break;

      case LogSource.DOCKER:
        try {
          const dockerCollector = new DockerCollector(config?.dockerOptions);
          rawLogs = await dockerCollector.getAllContainersLogs();
        } catch (error) {
          console.error('Docker collection error:', error);
          return NextResponse.json(
            { error: 'Failed to collect Docker logs' },
            { status: 500 }
          );
        }
        break;

      case LogSource.JENKINS:
        if (!config?.baseUrl) {
          return NextResponse.json(
            { error: 'Jenkins baseUrl is required' },
            { status: 400 }
          );
        }
        try {
          const jenkinsCollector = new JenkinsCollector(config);
          rawLogs = await jenkinsCollector.getAllJobsStatus();
        } catch (error) {
          console.error('Jenkins collection error:', error);
          return NextResponse.json(
            { error: 'Failed to collect Jenkins logs' },
            { status: 500 }
          );
        }
        break;

      case LogSource.EC2:
        if (!config?.region) {
          return NextResponse.json(
            { error: 'AWS region is required' },
            { status: 400 }
          );
        }
        try {
          const ec2Collector = new EC2Collector(config);
          const logGroups = await ec2Collector.listLogGroups();
          
          // Collect logs from all log groups
          for (const logGroup of logGroups.slice(0, 5)) {
            const logs = await ec2Collector.getLogGroupLogs(logGroup);
            rawLogs.push(...logs);
          }
        } catch (error) {
          console.error('EC2 collection error:', error);
          return NextResponse.json(
            { error: 'Failed to collect EC2 logs' },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid log source' },
          { status: 400 }
        );
    }

    // Analyze logs
    const analyzedLogs = LogAnalyzer.analyzeBatch(rawLogs);

    // Store in cache (replace with database)
    logsStore.add(analyzedLogs);

    return NextResponse.json({
      collected: rawLogs.length,
      analyzed: analyzedLogs.length,
      logs: analyzedLogs,
    });
  } catch (error) {
    console.error('Error processing logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

