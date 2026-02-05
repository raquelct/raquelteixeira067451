import { useState, useEffect, useCallback } from 'react';
import { healthService, HEALTH_CONFIG } from '../services/health.service';
import type { HealthCheckResponse } from '../types/health.types';

const REFRESH_INTERVAL = HEALTH_CONFIG.REFRESH_INTERVAL;

export const useHealthMonitor = () => {
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await healthService.performHealthCheck();
      setData(result);
      setLastUpdated(new Date());
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const intervalId = setInterval(checkHealth, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [checkHealth]);

  return { 
    health: data, 
    isLoading, 
    lastUpdated, 
    refresh: checkHealth 
  };
};