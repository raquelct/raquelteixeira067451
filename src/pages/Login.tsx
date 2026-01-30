import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { authFacade } from '../facades/auth.facade';
import { AxiosError } from 'axios';

/**
 * Página de Login
 * 
 * Features:
 * - Formulário validado com Zod + React Hook Form
 * - Layout responsivo e centralizado (Tailwind CSS)
 * - Loading spinner durante autenticação
 * - Mensagens de erro da API
 * - Integração com AuthFacade (Padrão Facade)
 * - Navegação automática após login bem-sucedido
 */
export const Login = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Validação em tempo real
  });

  /**
   * Verifica se usuário já está autenticado
   * Se sim, redireciona para Home (PetList)
   */
  useEffect(() => {
    if (authFacade.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  /**
   * Handler do formulário
   * Chama AuthFacade.login() e trata erros
   */
  const onSubmit = async (data: LoginFormData) => {
    setApiError('');
    setIsSubmitting(true);

    try {
      // Chama Facade (não service/axios diretamente!)
      await authFacade.login({
        username: data.username,
        password: data.password,
      });

      // Login bem-sucedido, navega para Home (PetList)
      navigate('/', { replace: true });
    } catch (error) {
      // Trata erros da API
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 401) {
          setApiError('Credenciais inválidas. Verifique seu email e senha.');
        } else if (status === 500) {
          setApiError('Erro no servidor. Tente novamente mais tarde.');
        } else if (message) {
          setApiError(message);
        } else {
          setApiError('Erro ao fazer login. Tente novamente.');
        }
      } else {
        setApiError('Erro inesperado. Verifique sua conexão.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Pet Registry
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                {...register('username')}
                id="username"
                type="text"
                autoComplete="username"
                className={`
                  appearance-none block w-full px-3 py-2 border rounded-md
                  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2
                  sm:text-sm transition-colors
                  bg-white text-gray-900 focus:text-gray-900
                  ${
                    errors.username
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }
                `}
                placeholder="admin"
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Campo Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className={`
                  appearance-none block w-full px-3 py-2 border rounded-md
                  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2
                  sm:text-sm transition-colors
                  bg-white text-gray-900 focus:text-gray-900
                  ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }
                `}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Mensagem de erro da API */}
            {apiError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão Submit */}
            <div>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`
                  w-full flex justify-center items-center py-2.5 px-4 border
                  border-transparent rounded-md shadow-sm text-sm font-medium
                  text-white transition-all duration-200
                  ${
                    !isValid || isSubmitting
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    {/* Loading Spinner */}
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Sistema de Registro de Pets - SEPLAG/MT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
