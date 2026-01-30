import { useState, useEffect } from 'react';
import { performHealthCheck } from '../utils/healthCheck';
import type { HealthCheckResponse } from '../types/health.types';

export const Home = () => {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleHealthCheck = async () => {
    setIsLoading(true);
    try {
      const status = await performHealthCheck();
      setHealthStatus(status);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Executa health check ao montar o componente
    handleHealthCheck();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🐾 Cadastro Público de Pets
            </h1>
            <p className="text-xl text-gray-600">
              Sistema de Registro de Animais de Estimação
            </p>
            <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
              SEPLAG/MT - Processo Seletivo Sênior
            </div>
          </div>

          {/* Stack Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Stack Tecnológico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚛️</span>
                <div>
                  <p className="font-semibold text-gray-700">React 18</p>
                  <p className="text-sm text-gray-500">Framework Frontend</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📘</span>
                <div>
                  <p className="font-semibold text-gray-700">TypeScript</p>
                  <p className="text-sm text-gray-500">Tipagem Estática</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="font-semibold text-gray-700">Tailwind CSS</p>
                  <p className="text-sm text-gray-500">Estilização Responsiva</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-semibold text-gray-700">RxJS BehaviorSubject</p>
                  <p className="text-sm text-gray-500">Gerenciamento de Estado</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="font-semibold text-gray-700">Axios</p>
                  <p className="text-sm text-gray-500">Cliente HTTP</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏗️</span>
                <div>
                  <p className="font-semibold text-gray-700">Facade Pattern</p>
                  <p className="text-sm text-gray-500">Arquitetura</p>
                </div>
              </div>
            </div>
          </div>

          {/* Health Check Status */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">🏥 Health Check</h2>
              <button
                onClick={handleHealthCheck}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Verificando...' : '🔄 Atualizar'}
              </button>
            </div>

            {healthStatus && (
              <div className="space-y-4">
                {/* Status Geral */}
                <div className={`p-4 rounded-lg ${
                  healthStatus.status === 'healthy' 
                    ? 'bg-green-100 border-2 border-green-300' 
                    : 'bg-red-100 border-2 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Status Geral:</span>
                    <span className={`font-bold ${
                      healthStatus.status === 'healthy' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {healthStatus.status === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Timestamp: {new Date(healthStatus.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Liveness Probe */}
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Liveness Probe:</span>
                    <span className={`font-bold ${
                      healthStatus.checks.liveness.status === 'pass' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {healthStatus.checks.liveness.status === 'pass' ? '✅ PASS' : '❌ FAIL'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {JSON.stringify(healthStatus.checks.liveness.details, null, 2)}
                  </p>
                </div>

                {/* Readiness Probe */}
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Readiness Probe:</span>
                    <span className={`font-bold ${
                      healthStatus.checks.readiness.status === 'pass' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {healthStatus.checks.readiness.status === 'pass' ? '✅ PASS' : '❌ FAIL'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {JSON.stringify(healthStatus.checks.readiness.details, null, 2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Desenvolvido para o processo seletivo SEPLAG/MT</p>
            <p className="mt-2 font-mono">API Base: https://pet-manager-api.geia.vip</p>
          </div>
        </div>
      </div>
    </div>
  );
};
