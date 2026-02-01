import { PawPrint } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';

export const Login = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-sm space-y-8">
        
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 mb-4 transition-transform hover:scale-110">
            <PawPrint size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Pet Manager
          </h2>
          <p className="mt-2 text-sm text-slate-500 text-center">
            Acesse o sistema para continuar
          </p>
        </div>

        <div className="bg-white px-8 py-10 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-400">
          © 2026 Sistema de Registro de Pets - SEPLAG/MT
        </p>
      </div>
    </div>
  );
};

export default Login;