export interface StoreWithLoading {
  setLoading(isLoading: boolean): void;
  setError?(error: string | undefined): void;
}

export abstract class BaseFacade<TStore extends StoreWithLoading> {
  protected abstract store: TStore;
  protected async executeWithLoading<T>(
    operation: () => Promise<T>,
    options?: {
      skipLoading?: boolean;
      skipClearError?: boolean;
    }
  ): Promise<T> {
    if (!options?.skipLoading) {
      this.store.setLoading(true);
      
      if (!options?.skipClearError && this.store.setError) {
        this.store.setError(undefined);
      }
    }

    try {
      return await operation();
    } finally {
      if (!options?.skipLoading) {
        this.store.setLoading(false);
      }
    }
  }

  protected createRequestKey(prefix: string, ...params: unknown[]): string {
    const serializedParams = params
      .map(param => {
        if (param === null || param === undefined) return 'null';
        if (typeof param === 'object') return JSON.stringify(param);
        return String(param);
      })
      .join('-');
    
    return `${prefix}-${serializedParams}`;
  }
}
