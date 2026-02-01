import type { HealthCheckResponse, HealthProbe } from '../types/health.types';
import apiClient from '../services/api';

// --- Constants & Config ---
export const HEALTH_CONFIG = {
  TIMEOUT_MS: 5000,
  ENDPOINT: '/health',
  REFRESH_INTERVAL: 30000,
} as const;

export const PROBE_STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
} as const;

const MESSAGES = {
  LIVENESS_OK: 'Application is alive',
  READINESS_OK: 'Application is ready',
  READINESS_FAIL: 'Application is not ready',
  UNKNOWN_ERROR: 'Unknown error',
} as const;

// --- Helpers ---

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : MESSAGES.UNKNOWN_ERROR;
};

const getAppUptime = (): number => {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return now / 1000;
};

// Factory Function for HealthProbe
const createProbe = (
  status: HealthProbe['status'],
  details: HealthProbe['details'] = {}
): HealthProbe => ({
  status,
  timestamp: new Date().toISOString(),
  details,
});

// --- Core Logic ---

export const checkLiveness = (): HealthProbe => {
  try {
    return createProbe(PROBE_STATUS.PASS, {
      uptime: getAppUptime(),
      message: MESSAGES.LIVENESS_OK,
    });
  } catch (error) {
    return createProbe(PROBE_STATUS.FAIL, {
      error: getErrorMessage(error),
    });
  }
};

export const checkReadiness = async (): Promise<HealthProbe> => {
  try {
    // Ideally this endpoint should be a dedicated health check endpoint on the API
    // For now we check connectivity to the server.
    await apiClient.get(HEALTH_CONFIG.ENDPOINT, { 
      timeout: HEALTH_CONFIG.TIMEOUT_MS 
    });

    return createProbe(PROBE_STATUS.PASS, {
      message: MESSAGES.READINESS_OK,
      apiConnectivity: 'OK',
    });
  } catch (error) {
    return createProbe(PROBE_STATUS.FAIL, {
      message: MESSAGES.READINESS_FAIL,
      apiConnectivity: 'FAILED',
      error: getErrorMessage(error),
    });
  }
};

export const performHealthCheck = async (): Promise<HealthCheckResponse> => {
  const [liveness, readiness] = await Promise.all([
    checkLiveness(),
    checkReadiness()
  ]);

  const isHealthy = liveness.status === PROBE_STATUS.PASS && readiness.status === PROBE_STATUS.PASS;

  return {
    status: isHealthy ? PROBE_STATUS.HEALTHY : PROBE_STATUS.UNHEALTHY,
    timestamp: new Date().toISOString(),
    checks: {
      liveness,
      readiness,
    },
  };
};