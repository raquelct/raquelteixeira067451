import { useRef, useEffect } from 'react';
import { Button } from './Button';
import { FormInput } from './FormInput';

interface GenericSelectModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  onSearch: (term: string) => void;
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  isLoading: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export const GenericSelectModal = <T,>({
  isOpen,
  onClose,
  title,
  items,
  onSearch,
  onSelect,
  renderItem,
  isLoading,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum item encontrado.',
}: GenericSelectModalProps<T>) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:ring-2 focus:ring-indigo-500 rounded p-1"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <FormInput
            ref={searchInputRef}
            label=""
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="mb-0"
            aria-label={searchPlaceholder}
          />
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {isLoading ? (
             <div className="flex justify-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={index}>
                    <button 
                        onClick={() => {
                        onSelect(item);
                        onClose();
                        }}
                        className="w-full p-3 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg border border-transparent hover:border-indigo-200 transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {renderItem(item)}
                    </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
