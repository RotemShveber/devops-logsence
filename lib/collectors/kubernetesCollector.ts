import * as k8s from '@kubernetes/client-node';
import { RawLog, LogSource } from '@/lib/types';
import { randomUUID } from 'crypto';

export class KubernetesCollector {
  private k8sApi: k8s.CoreV1Api;
  private kc: k8s.KubeConfig;

  constructor(kubeConfigPath?: string) {
    this.kc = new k8s.KubeConfig();
    
    if (kubeConfigPath) {
      this.kc.loadFromFile(kubeConfigPath);
    } else {
      this.kc.loadFromDefault();
    }
    
    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
  }

  async getPodLogs(
    namespace: string,
    podName: string,
    containerName?: string,
    tailLines: number = 100
  ): Promise<RawLog[]> {
    try {
      const response = await this.k8sApi.readNamespacedPodLog({
        name: podName,
        namespace: namespace,
        container: containerName,
        tailLines: tailLines,
      });

      const logLines = response.split('\n').filter(line => line.trim());
      
      return logLines.map(line => ({
        id: randomUUID(),
        source: LogSource.KUBERNETES,
        timestamp: this.extractTimestamp(line) || new Date(),
        message: line,
        metadata: {
          namespace,
          pod: podName,
          container: containerName,
        },
        rawData: line,
      }));
    } catch (error) {
      console.error(`Error fetching logs for pod ${podName}:`, error);
      return [];
    }
  }

  async getAllPodsLogs(namespace: string = 'default', tailLines: number = 50): Promise<RawLog[]> {
    try {
      const podsResponse = await this.k8sApi.listNamespacedPod({ namespace });
      const allLogs: RawLog[] = [];

      for (const pod of podsResponse.items) {
        if (pod.metadata?.name) {
          const podLogs = await this.getPodLogs(
            namespace,
            pod.metadata.name,
            pod.spec?.containers[0]?.name,
            tailLines
          );
          allLogs.push(...podLogs);
        }
      }

      return allLogs;
    } catch (error) {
      console.error(`Error fetching all pods logs:`, error);
      return [];
    }
  }

  async getEvents(namespace: string = 'default', limitMinutes: number = 60): Promise<RawLog[]> {
    try {
      const eventsResponse = await this.k8sApi.listNamespacedEvent({ namespace });
      const cutoffTime = new Date(Date.now() - limitMinutes * 60 * 1000);

      const events = eventsResponse.items
        .filter(event => {
          const eventTime = event.lastTimestamp || event.firstTimestamp;
          return eventTime && new Date(eventTime) > cutoffTime;
        })
        .map(event => ({
          id: randomUUID(),
          source: LogSource.KUBERNETES,
          timestamp: new Date(event.lastTimestamp || event.firstTimestamp || new Date()),
          message: `${event.reason}: ${event.message}`,
          metadata: {
            namespace,
            kind: event.involvedObject.kind,
            name: event.involvedObject.name,
            type: event.type,
            reason: event.reason,
          },
          rawData: JSON.stringify(event),
        }));

      return events;
    } catch (error) {
      console.error(`Error fetching Kubernetes events:`, error);
      return [];
    }
  }

  private extractTimestamp(logLine: string): Date | null {
    // Try to extract ISO timestamp
    const isoMatch = logLine.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/);
    if (isoMatch) {
      return new Date(isoMatch[0]);
    }

    // Try to extract other common formats
    const dateMatch = logLine.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);
    if (dateMatch) {
      return new Date(dateMatch[0]);
    }

    return null;
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const response = await this.k8sApi.listNamespace();
      return response.items
        .map(ns => ns.metadata?.name)
        .filter((name): name is string => !!name);
    } catch (error) {
      console.error('Error listing namespaces:', error);
      return [];
    }
  }
}

