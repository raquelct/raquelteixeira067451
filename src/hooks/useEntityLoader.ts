import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface UseEntityLoaderOptions<T> {
  fetcher: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  errorMessage?: string;
  shouldFetch?: boolean;
}

export const useEntityLoader = <T>({
  fetcher,
  onSuccess,
  onError,
  errorMessage = 'Erro ao carregar dados',
  shouldFetch = true,
}: UseEntityLoaderOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(shouldFetch);
  const [error, setError] = useState<unknown | null>(null);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadData = useCallback(async () => {
    if (!shouldFetch) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await fetcher();
      setData(result);
      
      if (onSuccessRef.current) {
        onSuccessRef.current(result);
      }
    } catch (err) {
      console.error('[useEntityLoader] Error:', err);
      setError(err);
      toast.error(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, errorMessage, shouldFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};
