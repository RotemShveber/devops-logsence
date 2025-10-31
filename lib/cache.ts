import { AnalyzedLog } from './types';

// Shared in-memory storage for logs
// In production, replace with a proper database
class LogsStore {
  private logs: AnalyzedLog[] = [];

  getAll(): AnalyzedLog[] {
    return this.logs;
  }

  add(logs: AnalyzedLog[]): void {
    this.logs.push(...logs);
    if (this.logs.length > 10000) {
      this.logs.splice(0, this.logs.length - 10000);
    }
  }

  clear(): void {
    this.logs.length = 0;
  }

  filter(predicate: (log: AnalyzedLog) => boolean): AnalyzedLog[] {
    return this.logs.filter(predicate);
  }

  get length(): number {
    return this.logs.length;
  }
}

export const logsStore = new LogsStore();
