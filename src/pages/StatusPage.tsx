import { Activity, RefreshCw, CheckCircle2, XCircle, Server } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { AppShell } from '../components/layout/AppShell';
import { useHealthMonitor } from '../hooks/useHealthMonitor';
import { ProbeCard } from '../components/health/ProbeCard';
import { PROBE_STATUS, HEALTH_CONFIG } from '../utils/healthCheck';

const STATUS_CONFIG = {
  active: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
    label: 'Todos os sistemas operacionais'
  },
  inactive: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: <XCircle className="w-8 h-8 text-red-600" />,
    label: 'Alguns sistemas apresentam falha'
  },
  loading: {
    color: 'text-slate-400',
    bg: 'bg-slate-100',
    icon: <Activity className="w-8 h-8 text-slate-400" />,
    label: 'Verificando...'
  }
};

export const StatusPage = () => {
  const { health, isLoading, lastUpdated, refresh } = useHealthMonitor();

  const getGlobalStatusConfig = () => {
    if (isLoading && !health) return STATUS_CONFIG.loading;
    return health?.status === PROBE_STATUS.HEALTHY ? STATUS_CONFIG.active : STATUS_CONFIG.inactive;
  };

  const statusConfig = getGlobalStatusConfig();

  return (
    <AppShell>
      <div className="flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              Status do Sistema
            </h1>
            <p className="text-slate-500">Monitoramento em tempo real da saúde da aplicação</p>
          </div>

          {/* Global Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transition-colors duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isLoading ? 'animate-pulse' : ''} ${statusConfig.bg}`}>
                  {statusConfig.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Status Geral</h2>
                  <p className={`text-sm font-medium transition-colors duration-300 ${statusConfig.color}`}>
                    {statusConfig.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-slate-500">Última atualização</p>
                  <p className="text-sm font-mono text-slate-700">
                    {format(lastUpdated, "HH:mm:ss", { locale: ptBR })}
                  </p>
                </div>
                <button 
                  onClick={refresh}
                  disabled={isLoading}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 group"
                  title="Atualizar agora"
                >
                  <RefreshCw className={`w-5 h-5 text-slate-600 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProbeCard
              title="Liveness Probe"
              description="Integridade da Aplicação"
              icon={Activity}
              iconColorClass="text-indigo-600"
              iconBgClass="bg-indigo-50"
              status={health?.checks.liveness.status}
              isLoading={isLoading && !health}
              details={health?.checks.liveness.details ? {
                uptime: health.checks.liveness.details.uptime 
                  ? `${Number(health.checks.liveness.details.uptime).toFixed(2)}s` 
                  : '-',
                message: health.checks.liveness.details.message as string
              } : undefined}
            />

            <ProbeCard
              title="Readiness Probe"
              description="Conectividade API"
              icon={Server}
              iconColorClass="text-blue-600"
              iconBgClass="bg-blue-50"
              status={health?.checks.readiness.status}
              isLoading={isLoading && !health}
              details={{
               latency: '-', // Placeholder for future implementation
               error: (health?.checks.readiness.details?.error as string) || 'Nenhum'
              }}
            />
          </div>
          
          <div className="text-center text-xs text-slate-400">
            Status atualizado automaticamente a cada {HEALTH_CONFIG.REFRESH_INTERVAL / 1000} segundos.
          </div>
        </div>
      </div>
    </AppShell>
  );
};
