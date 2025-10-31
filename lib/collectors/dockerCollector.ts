import Docker from 'dockerode';
import { RawLog, LogSource } from '@/lib/types';
import { randomUUID } from 'crypto';

export class DockerCollector {
  private docker: Docker;

  constructor(dockerOptions?: Docker.DockerOptions) {
    this.docker = new Docker(dockerOptions || { socketPath: '/var/run/docker.sock' });
  }

  async getContainerLogs(
    containerId: string,
    tailLines: number = 100
  ): Promise<RawLog[]> {
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: tailLines,
        timestamps: true,
      });

      const logLines = logs
        .toString('utf8')
        .split('\n')
        .filter(line => line.trim());

      return logLines.map(line => {
        // Docker logs have 8-byte header, strip it if present
        const cleanLine = this.stripDockerHeader(line);
        
        return {
          id: randomUUID(),
          source: LogSource.DOCKER,
          timestamp: this.extractTimestamp(cleanLine) || new Date(),
          message: cleanLine,
          metadata: {
            containerId: info.Id,
            containerName: info.Name,
            image: info.Config.Image,
            state: info.State.Status,
          },
          rawData: line,
        };
      });
    } catch (error) {
      console.error(`Error fetching logs for container ${containerId}:`, error);
      return [];
    }
  }

  async getAllContainersLogs(tailLines: number = 50): Promise<RawLog[]> {
    try {
      const containers = await this.docker.listContainers({ all: false });
      const allLogs: RawLog[] = [];

      for (const containerInfo of containers) {
        const logs = await this.getContainerLogs(containerInfo.Id, tailLines);
        allLogs.push(...logs);
      }

      return allLogs;
    } catch (error) {
      console.error('Error fetching all container logs:', error);
      return [];
    }
  }

  async getContainerEvents(since?: number): Promise<RawLog[]> {
    try {
      const sinceTimestamp = since || Math.floor(Date.now() / 1000) - 3600; // Default: last hour

      const events = await this.docker.getEvents({
        since: sinceTimestamp,
        filters: JSON.stringify({
          type: ['container'],
        }),
      });

      const eventLogs: RawLog[] = [];

      // Docker events is a stream, we need to handle it differently
      return new Promise((resolve) => {
        events.on('data', (chunk: Buffer) => {
          try {
            const eventData = JSON.parse(chunk.toString());

            eventLogs.push({
              id: randomUUID(),
              source: LogSource.DOCKER,
              timestamp: new Date(eventData.time * 1000),
              message: `Container ${eventData.Action}: ${eventData.Actor?.Attributes?.name || eventData.Actor?.ID}`,
              metadata: {
                action: eventData.Action,
                containerId: eventData.Actor?.ID,
                containerName: eventData.Actor?.Attributes?.name,
                image: eventData.Actor?.Attributes?.image,
              },
              rawData: JSON.stringify(eventData),
            });
          } catch (err) {
            console.error('Error parsing Docker event:', err);
          }
        });

        // Wait a bit to collect events, then close the stream
        setTimeout(() => {
          if (events && typeof (events as any).destroy === 'function') {
            (events as any).destroy();
          }
          resolve(eventLogs);
        }, 1000);
      });
    } catch (error) {
      console.error('Error fetching Docker events:', error);
      return [];
    }
  }

  async listContainers(): Promise<Array<{ id: string; name: string; status: string }>> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      return containers.map(c => ({
        id: c.Id,
        name: c.Names[0]?.replace(/^\//, '') || 'unknown',
        status: c.State,
      }));
    } catch (error) {
      console.error('Error listing containers:', error);
      return [];
    }
  }

  private stripDockerHeader(line: string): string {
    // Docker logs prepend 8 bytes: 1 byte stream type + 3 bytes padding + 4 bytes size
    // When converted to string, this might show as special characters
    // Remove non-printable characters at the start
    return line.replace(/^[\x00-\x1F]+/, '');
  }

  private extractTimestamp(logLine: string): Date | null {
    // Docker timestamp format: 2024-01-01T12:00:00.123456789Z
    const timestampMatch = logLine.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?)\s/);
    if (timestampMatch) {
      return new Date(timestampMatch[1]);
    }

    // Try ISO format without nanoseconds
    const isoMatch = logLine.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/);
    if (isoMatch) {
      return new Date(isoMatch[0]);
    }

    return null;
  }
}

