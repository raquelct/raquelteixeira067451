import { forwardRef, type InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    className?: string;
}

/**
 * FormInput - Componente de input reutilizável
 * Compatível com react-hook-form via forwardRef
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className={className}>
                <label
                    htmlFor={props.id || props.name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                </label>
                <input
                    ref={ref}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-colors ${error ? 'border-red-500' : 'border-gray-300'
                        }`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
