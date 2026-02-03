import { type ReactNode, useEffect, useState } from 'react';
import { PageHeader } from '../shared/PageHeader';
import { SearchBar } from '../shared/SearchBar';
import { Button } from '../shared/Button';
import { ErrorState } from '../shared/ErrorState';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { Pagination } from '../shared/Pagination';
import { containerStyles } from '../../styles/theme';
import { ConfirmationModal } from '../shared/ConfirmationModal';

interface ResourceListProps<T> {
  title: string;
  subtitle: string;
  icon: string;
  buttonLabel?: string;
  onNewClick?: () => void;
  isLoading: boolean;
  error?: string | null;
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
  searchPlaceholder?: string;
  renderCard: (item: T) => ReactNode;
  emptyState: {
    title: string;
    description: string;
    icon?: ReactNode;
  };
  deleteModal?: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: ReactNode;
  };
}

export function ResourceList<T>({
  title,
  subtitle,
  icon,
  buttonLabel,
  onNewClick,
  isLoading,
  error,
  data,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  searchPlaceholder = 'Buscar...',
  renderCard,
  emptyState,
  deleteModal,
}: ResourceListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    onSearch('');
  };

  const PAGE_SIZE = 10;

  return (
    <div className="w-full">
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        buttonLabel={buttonLabel}
        onButtonClick={onNewClick}
      />

      <div className="max-full mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={clearSearch}
          placeholder={searchPlaceholder}
          className="w-full"
        />
      </div>

      {debouncedSearchTerm && (
        <p className="mb-6 text-sm text-gray-500">
          Buscando por: <span className="font-semibold">"{debouncedSearchTerm}"</span>
        </p>
      )}

      {error && (
        <ErrorState
          title={`Erro ao carregar ${title.toLowerCase()}`}
          message={error}
          onRetry={() => onSearch(debouncedSearchTerm)}
        />
      )}

      {isLoading && <LoadingSkeleton type="card" count={PAGE_SIZE} />}

      {!isLoading && !error && data.length === 0 && (
        <EmptyState
          icon={
            emptyState.icon || (
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            )
          }
          title={debouncedSearchTerm ? `Nenhum resultado para "${debouncedSearchTerm}"` : emptyState.title}
          description={debouncedSearchTerm ? 'Tente buscar com outros termos' : emptyState.description}
          action={
            debouncedSearchTerm ? (
              <Button variant="primary" onClick={clearSearch}>
                Limpar Busca
              </Button>
            ) : buttonLabel && onNewClick ? (
               <Button variant="primary" onClick={onNewClick}>
                 {buttonLabel}
               </Button>
            ) : null
          }
        />
      )}

      {!isLoading && !error && data.length > 0 && (
        <>
          <div className={containerStyles.grid}>
            {data.map((item) => renderCard(item))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => {
                onPageChange(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}

      {deleteModal && (
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
          onConfirm={deleteModal.onConfirm}
          title={deleteModal.title}
          message={deleteModal.message}
          confirmLabel="Excluir"
          variant="danger"
        />
      )}
    </div>
  );
}
