import axios, { AxiosInstance } from 'axios';
import { RawLog, LogSource } from '@/lib/types';
import { randomUUID } from 'crypto';

interface JenkinsConfig {
  baseUrl: string;
  username?: string;
  apiToken?: string;
}

export class JenkinsCollector {
  private client: AxiosInstance;

  constructor(config: JenkinsConfig) {
    const auth = config.username && config.apiToken
      ? {
          username: config.username,
          password: config.apiToken,
        }
      : undefined;

    this.client = axios.create({
      baseURL: config.baseUrl,
      auth,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getBuildLogs(jobName: string, buildNumber: number): Promise<RawLog[]> {
    try {
      const response = await this.client.get(
        `/job/${jobName}/${buildNumber}/consoleText`
      );

      const logLines = response.data
        .split('\n')
        .filter((line: string) => line.trim());

      return logLines.map((line: string) => ({
        id: randomUUID(),
        source: LogSource.JENKINS,
        timestamp: this.extractTimestamp(line) || new Date(),
        message: line,
        metadata: {
          jobName,
          buildNumber,
        },
        rawData: line,
      }));
    } catch (error) {
      console.error(`Error fetching logs for job ${jobName} build ${buildNumber}:`, error);
      return [];
    }
  }

  async getLastBuildLogs(jobName: string): Promise<RawLog[]> {
    try {
      // Get last build number
      const jobInfo = await this.client.get(`/job/${jobName}/api/json`);
      const lastBuild = jobInfo.data.lastBuild;

      if (!lastBuild) {
        return [];
      }

      return this.getBuildLogs(jobName, lastBuild.number);
    } catch (error) {
      console.error(`Error fetching last build logs for job ${jobName}:`, error);
      return [];
    }
  }

  async getFailedBuildsLogs(jobName: string, limit: number = 5): Promise<RawLog[]> {
    try {
      const jobInfo = await this.client.get(`/job/${jobName}/api/json?tree=builds[number,result]`);
      const builds = jobInfo.data.builds || [];

      const failedBuilds = builds
        .filter((build: any) => build.result === 'FAILURE' || build.result === 'UNSTABLE')
        .slice(0, limit);

      const allLogs: RawLog[] = [];

      for (const build of failedBuilds) {
        const logs = await this.getBuildLogs(jobName, build.number);
        allLogs.push(...logs);
      }

      return allLogs;
    } catch (error) {
      console.error(`Error fetching failed builds for job ${jobName}:`, error);
      return [];
    }
  }

  async getAllJobsStatus(): Promise<RawLog[]> {
    try {
      const response = await this.client.get('/api/json?tree=jobs[name,lastBuild[number,result,timestamp]]');
      const jobs = response.data.jobs || [];

      return jobs
        .filter((job: any) => job.lastBuild)
        .map((job: any) => ({
          id: randomUUID(),
          source: LogSource.JENKINS,
          timestamp: new Date(job.lastBuild.timestamp),
          message: `Job ${job.name} - Build #${job.lastBuild.number}: ${job.lastBuild.result}`,
          metadata: {
            jobName: job.name,
            buildNumber: job.lastBuild.number,
            result: job.lastBuild.result,
          },
          rawData: JSON.stringify(job),
        }));
    } catch (error) {
      console.error('Error fetching all jobs status:', error);
      return [];
    }
  }

  async listJobs(): Promise<Array<{ name: string; status: string }>> {
    try {
      const response = await this.client.get('/api/json?tree=jobs[name,color]');
      const jobs = response.data.jobs || [];

      return jobs.map((job: any) => ({
        name: job.name,
        status: job.color,
      }));
    } catch (error) {
      console.error('Error listing Jenkins jobs:', error);
      return [];
    }
  }

  private extractTimestamp(logLine: string): Date | null {
    // Jenkins timestamp format: [2024-01-01 12:00:00]
    const timestampMatch = logLine.match(/\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]/);
    if (timestampMatch) {
      return new Date(timestampMatch[1]);
    }

    // Try ISO format
    const isoMatch = logLine.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/);
    if (isoMatch) {
      return new Date(isoMatch[0]);
    }

    return null;
  }
}

