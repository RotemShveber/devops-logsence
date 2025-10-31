import AWS from 'aws-sdk';
import { RawLog, LogSource } from '@/lib/types';
import { randomUUID } from 'crypto';

interface EC2CollectorConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export class EC2Collector {
  private cloudwatchLogs: AWS.CloudWatchLogs;
  private ec2: AWS.EC2;

  constructor(config: EC2CollectorConfig) {
    const awsConfig: AWS.CloudWatchLogs.ClientConfiguration = {
      region: config.region,
    };

    if (config.accessKeyId && config.secretAccessKey) {
      awsConfig.accessKeyId = config.accessKeyId;
      awsConfig.secretAccessKey = config.secretAccessKey;
    }

    this.cloudwatchLogs = new AWS.CloudWatchLogs(awsConfig);
    this.ec2 = new AWS.EC2(awsConfig);
  }

  async getLogStreamEvents(
    logGroupName: string,
    logStreamName: string,
    limit: number = 100
  ): Promise<RawLog[]> {
    try {
      const params: AWS.CloudWatchLogs.GetLogEventsRequest = {
        logGroupName,
        logStreamName,
        limit,
        startFromHead: false, // Get most recent logs first
      };

      const response = await this.cloudwatchLogs.getLogEvents(params).promise();
      const events = response.events || [];

      return events.map(event => ({
        id: randomUUID(),
        source: LogSource.EC2,
        timestamp: new Date(event.timestamp || Date.now()),
        message: event.message || '',
        metadata: {
          logGroup: logGroupName,
          logStream: logStreamName,
        },
        rawData: JSON.stringify(event),
      }));
    } catch (error) {
      console.error(`Error fetching log stream ${logStreamName}:`, error);
      return [];
    }
  }

  async getLogGroupLogs(
    logGroupName: string,
    limit: number = 50
  ): Promise<RawLog[]> {
    try {
      // Get all log streams in the group
      const streamsResponse = await this.cloudwatchLogs
        .describeLogStreams({
          logGroupName,
          orderBy: 'LastEventTime',
          descending: true,
          limit: 10, // Get top 10 most recent streams
        })
        .promise();

      const streams = streamsResponse.logStreams || [];
      const allLogs: RawLog[] = [];

      for (const stream of streams) {
        if (stream.logStreamName) {
          const logs = await this.getLogStreamEvents(
            logGroupName,
            stream.logStreamName,
            Math.floor(limit / streams.length)
          );
          allLogs.push(...logs);
        }
      }

      return allLogs;
    } catch (error) {
      console.error(`Error fetching log group ${logGroupName}:`, error);
      return [];
    }
  }

  async filterLogsByPattern(
    logGroupName: string,
    filterPattern: string,
    startTime?: number,
    endTime?: number
  ): Promise<RawLog[]> {
    try {
      const params: AWS.CloudWatchLogs.FilterLogEventsRequest = {
        logGroupName,
        filterPattern,
        startTime: startTime || Date.now() - 3600000, // Default: last hour
        endTime: endTime || Date.now(),
        limit: 100,
      };

      const response = await this.cloudwatchLogs.filterLogEvents(params).promise();
      const events = response.events || [];

      return events.map(event => ({
        id: randomUUID(),
        source: LogSource.EC2,
        timestamp: new Date(event.timestamp || Date.now()),
        message: event.message || '',
        metadata: {
          logGroup: logGroupName,
          logStream: event.logStreamName,
        },
        rawData: JSON.stringify(event),
      }));
    } catch (error) {
      console.error(`Error filtering logs in ${logGroupName}:`, error);
      return [];
    }
  }

  async getErrorLogs(logGroupName: string): Promise<RawLog[]> {
    // Filter for common error patterns
    const errorPatterns = ['ERROR', 'error', 'FATAL', 'Exception', 'failed'];
    const allErrorLogs: RawLog[] = [];

    for (const pattern of errorPatterns) {
      const logs = await this.filterLogsByPattern(logGroupName, pattern);
      allErrorLogs.push(...logs);
    }

    // Remove duplicates based on message
    const uniqueLogs = allErrorLogs.filter(
      (log, index, self) =>
        index === self.findIndex(l => l.message === log.message && l.timestamp === log.timestamp)
    );

    return uniqueLogs;
  }

  async listLogGroups(): Promise<string[]> {
    try {
      const response = await this.cloudwatchLogs.describeLogGroups({}).promise();
      return (response.logGroups || [])
        .map(group => group.logGroupName)
        .filter((name): name is string => !!name);
    } catch (error) {
      console.error('Error listing log groups:', error);
      return [];
    }
  }

  async listEC2Instances(): Promise<Array<{ id: string; name: string; state: string }>> {
    try {
      const response = await this.ec2.describeInstances({}).promise();
      const instances: Array<{ id: string; name: string; state: string }> = [];

      for (const reservation of response.Reservations || []) {
        for (const instance of reservation.Instances || []) {
          const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
          instances.push({
            id: instance.InstanceId || 'unknown',
            name: nameTag?.Value || 'unnamed',
            state: instance.State?.Name || 'unknown',
          });
        }
      }

      return instances;
    } catch (error) {
      console.error('Error listing EC2 instances:', error);
      return [];
    }
  }
}

