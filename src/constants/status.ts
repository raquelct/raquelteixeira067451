export const HEALTH_CONFIG = {
  TIMEOUT_MS: 5000,
  ENDPOINTS: {
    LIVE: '/q/health/live',
    READY: '/q/health/ready',
  },
  REFRESH_INTERVAL: 30000,
} as const;

export const PROBE_STATUS = {
  PASS: 'UP',
  FAIL: 'DOWN',
  HEALTHY: 'UP',
  UNHEALTHY: 'DOWN',
} as const;

export const MESSAGES = {
  LIVENESS_OK: 'Application is alive',
  READINESS_OK: 'Application is ready',
  READINESS_FAIL: 'Application is not ready',
  UNKNOWN_ERROR: 'Unknown error',
} as const;