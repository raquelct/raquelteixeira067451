export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    liveness: HealthProbe;
    readiness: HealthProbe;
  };
}

export interface HealthProbe {
  status: 'pass' | 'fail';
  timestamp: string;
  details?: Record<string, unknown>;
}
