import { Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const StatusButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/status') return null;

  return (
    <button
      onClick={() => navigate('/status')}
      className="fixed bottom-6 right-6 z-50 p-3 bg-white text-indigo-600 rounded-full shadow-lg border border-slate-200 hover:shadow-xl hover:bg-indigo-50 hover:scale-110 transition-all duration-300 group"
      title="Status do Sistema"
      aria-label="Ver status do sistema"
    >
      <Activity className="w-6 h-6 animate-pulse group-hover:animate-none" />
      <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Status do Sistema
      </span>
    </button>
  );
};
