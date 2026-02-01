import { type LucideIcon, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import React from 'react';

export type ProbeStatus = 'pass' | 'fail' | 'warn' | string;

export interface ProbeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  status: ProbeStatus | undefined;
  isLoading?: boolean;
  details?: Record<string, string | number | undefined>;
}

const STATUS_STYLES = {
  pass: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Operacional'
  },
  fail: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Falha'
  },
  warn: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Atenção'
  },
  loading: {
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    icon: <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" />,
    label: 'Verificando...'
  }
};

export const ProbeCard: React.FC<ProbeCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColorClass = 'text-indigo-600',
  iconBgClass = 'bg-indigo-50',
  status,
  isLoading = false,
  details
}) => {
  const currentStyle = isLoading 
    ? STATUS_STYLES.loading 
    : STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.fail;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none`}>
        <Icon className="w-24 h-24" />
      </div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBgClass} ${iconColorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
          {currentStyle.icon}
          {currentStyle.label}
        </div>
      </div>
      
      {details && (
        <div className="space-y-2 relative z-10">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm group">
              <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="font-mono text-slate-700 truncate max-w-[200px]" title={String(value || '')}>
                {value !== undefined && value !== null ? String(value) : '-'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
