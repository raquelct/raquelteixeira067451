export interface HealthCheckResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  checks: {
    liveness: HealthProbe;
    readiness: HealthProbe;
  };
}

export interface HealthProbe {
  status: 'UP' | 'DOWN';
  timestamp: string;
  details?: Record<string, unknown>;
}
