import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    className?: string;
}


export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className={className}>
                <label
                    htmlFor={props.id || props.name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                </label>
                <div className="relative">
                    <input
                        ref={ref}
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-400 ${
                            error ? 'border-red-500' : 'border-gray-300'
                        }`}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:text-indigo-600"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

PasswordInput.displayName = 'PasswordInput';
