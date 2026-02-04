export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<unknown>>();
  async deduplicate<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const promise = operation().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  hasPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }
}
