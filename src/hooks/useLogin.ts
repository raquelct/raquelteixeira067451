import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authFacade } from '../facades/auth.facade';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';

export const useLogin = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting }, 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const handleLogin = async (data: LoginFormData) => {
    clearErrors('root');

    try {
      await authFacade.login(data);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        setError('root', {
          type: 'manual',
          message: 'Credenciais inválidas. Verifique seu usuário e senha.'
        });
      }
    }
  };

  return {
    register,
    onSubmit: handleSubmit(handleLogin),
    errors,
    isValid,
    isSubmitting,
  };
};