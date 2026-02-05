import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, type MockedFunction, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { useLogin } from '../../hooks/useLogin';


vi.mock('../../hooks/useLogin');

vi.mock('../shared/FormInput', () => ({
  FormInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input data-testid="form-input" {...props} />
}));

vi.mock('../shared/PasswordInput', () => ({
  PasswordInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input data-testid="password-input" type="password" {...props} />
}));

vi.mock('../shared/Button', () => ({
  Button: ({ children, onClick, disabled, loading }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean, loading?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-loading={loading}>
      {children}
    </button>
  )
}));

describe('LoginForm', () => {
  const mockRegister = vi.fn();
  const mockOnSubmit = vi.fn((e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    return Promise.resolve();
  });
  
  const useLoginMock = useLogin as MockedFunction<typeof useLogin>;

  beforeEach(() => {
    useLoginMock.mockReturnValue({
      register: mockRegister,
      errors: {},
      isValid: true,
      isSubmitting: false,
      onSubmit: mockOnSubmit
    });
  });

  it('should render form fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByTestId('form-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('should disable button when invalid or submitting', () => {
    useLoginMock.mockReturnValue({
      register: mockRegister,
      errors: {},
      isValid: false,
      isSubmitting: true,
      onSubmit: mockOnSubmit
    });

    render(<LoginForm />);
    
    const button = screen.getByText('Entrar');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-loading', 'true');
  });
});
