import { AlertCircle } from 'lucide-react';
import { useLogin } from '../../hooks/useLogin';
import { FormInput } from '../shared/FormInput';
import { Button } from '../shared/Button';

export const LoginForm = () => {
  const { 
    register, 
    errors, 
    isValid, 
    isSubmitting, 
    onSubmit 
  } = useLogin();

  const rootError = errors.root?.message;

  return (
    <form onSubmit={onSubmit} className="space-y-5 w-full">
      {rootError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{rootError}</p>
        </div>
      )}

      <FormInput
        label="Usuário"
        id="username"
        placeholder="Digite seu usuário"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
        disabled={isSubmitting}
      />

      <FormInput
        label="Senha"
        id="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        fullWidth
        loading={isSubmitting}
        disabled={!isValid || isSubmitting}
      >
        Entrar
      </Button>
    </form>
  );
};
