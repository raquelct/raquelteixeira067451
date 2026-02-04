import { ChevronLeft } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export const FormHeader = ({ title, subtitle, onBack }: FormHeaderProps) => {
  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Voltar
      </button>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
};
