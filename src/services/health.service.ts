import type { HealthCheckResponse, HealthProbe } from '../types/health.types';
import apiClient from './api';
import { HEALTH_CONFIG, PROBE_STATUS, MESSAGES } from '../constants/status';


class HealthService {
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return typeof error === 'string' ? error : MESSAGES.UNKNOWN_ERROR;
  }

  private getAppUptime(): number {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return now / 1000;
  }

  private createProbe(
    status: HealthProbe['status'],
    details: HealthProbe['details'] = {}
  ): HealthProbe {
    return {
      status,
      timestamp: new Date().toISOString(),
      details,
    };
  }

  async checkLiveness(): Promise<HealthProbe> {
    try {
      await apiClient.get(HEALTH_CONFIG.ENDPOINTS.LIVE, {
        timeout: HEALTH_CONFIG.TIMEOUT_MS
      });

      return this.createProbe(PROBE_STATUS.PASS, {
        uptime: this.getAppUptime(),
        message: MESSAGES.LIVENESS_OK,
      });
    } catch (error) {
      return this.createProbe(PROBE_STATUS.FAIL, {
        error: this.getErrorMessage(error),
      });
    }
  }

  async checkReadiness(): Promise<HealthProbe> {
    try {
      await apiClient.get(HEALTH_CONFIG.ENDPOINTS.READY, { 
        timeout: HEALTH_CONFIG.TIMEOUT_MS 
      });

      return this.createProbe(PROBE_STATUS.PASS, {
        message: MESSAGES.READINESS_OK,
        apiConnectivity: 'OK',
      });
    } catch (error) {
      return this.createProbe(PROBE_STATUS.FAIL, {
        message: MESSAGES.READINESS_FAIL,
        apiConnectivity: 'FAILED',
        error: this.getErrorMessage(error),
      });
    }
  }

  async performHealthCheck(): Promise<HealthCheckResponse> {
    const [liveness, readiness] = await Promise.all([
      this.checkLiveness(),
      this.checkReadiness()
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
  }
}

export const healthService = new HealthService();
export { PROBE_STATUS, HEALTH_CONFIG };

