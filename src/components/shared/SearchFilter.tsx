import { useState, useRef, useMemo, useEffect } from 'react';
import { Search, X, ChevronDown, Filter, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  options: readonly FilterOption[];
  onSearch: (filter: string, term: string) => void;
  placeholder?: string;
}

export function SearchFilter({ 
  options, 
  onSearch, 
  placeholder = 'Buscar...' 
}: SearchFilterProps) {
  const [filterType, setFilterType] = useState(options[0]?.value || '');
  const [text, setText] = useState('');
  const [query, debouncedControl] = useDebounce(text, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSearch(filterType, query);
  }, [query, filterType, onSearch]);

  const handleSearchChange = (term: string) => {
    setText(term);
    if (term === '') {
      debouncedControl.flush();
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    setFilterType(newFilter);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setText(''); 
    debouncedControl.flush();
    inputRef.current?.focus();
  };

  const currentLabel = useMemo(
    () => options.find(opt => opt.value === filterType)?.label,
    [options, filterType]
  );

  const isTyping = text !== query;

  return (
    <div className="w-full space-y-2">
      <div className="group flex items-center w-full bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 hover:border-gray-300">
        
        <div className="relative flex items-center h-full">
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            <Filter size={16} />
          </div>
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="h-12 pl-10 pr-8 text-sm font-medium text-gray-700 bg-transparent border-r border-gray-100 outline-none cursor-pointer appearance-none hover:bg-gray-50 rounded-l-lg transition-colors"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 pointer-events-none text-gray-400">
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="flex-1 flex items-center px-3 gap-2">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-12 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
          />
          {text ? (
             <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="h-5 pl-1 flex items-center gap-2">
        {isTyping ? (
             <p className="text-xs text-indigo-500 flex items-center gap-1.5 animate-in fade-in">
                <Loader2 size={12} className="animate-spin" />
                Digitando...
             </p>
        ) : query ? (
          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-top-1">
            Buscando por{' '}
            <span className="font-semibold text-blue-600">"{query}"</span>
            {' '}em{' '}
            <span className="font-medium text-gray-700">{currentLabel}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
