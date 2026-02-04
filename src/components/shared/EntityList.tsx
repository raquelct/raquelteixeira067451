import type { ReactNode } from 'react';
import { PageHeader } from '../shared/PageHeader';
import { SearchFilter } from '../shared/SearchFilter';
import { ErrorState } from '../shared/ErrorState';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { Pagination } from '../shared/Pagination';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { Button } from '../shared/Button';
import { containerStyles } from '../../styles/theme';
import { PAGINATION } from '../../constants/pagination';
import type { FilterOption } from '../../constants/filters';

interface EntityListProps<T> {
  title: string;
  subtitle: string;
  icon: string;
  buttonLabel: string;
  onNewClick: () => void;
  isLoading: boolean;
  error: string | null;
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onSearch: (filter: string, term: string) => void;
  filterOptions: readonly FilterOption[];
  searchPlaceholder: string;
  renderCard: (item: T) => ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  emptyStateIcon: ReactNode;
  isSearching: boolean;
  deleteModal: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: ReactNode;
  };
}

export function EntityList<T extends { id: number }>({
  title,
  subtitle,
  icon,
  buttonLabel,
  onNewClick,
  isLoading,
  error,
  data,
  currentPage,
  totalPages,
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  onPageChange,
  onSearch,
  filterOptions,
  searchPlaceholder,
  renderCard,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateIcon,
  isSearching,
  deleteModal,
}: EntityListProps<T>) {
  const handlePageChangeWithScroll = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        buttonLabel={buttonLabel}
        onButtonClick={onNewClick}
      />

      <div className="max-full mb-6 flex justify-center">
        <SearchFilter
          options={filterOptions}
          onSearch={onSearch}
          placeholder={searchPlaceholder}
        />
      </div>

      {error && (
        <ErrorState
          title={`Erro ao carregar ${title.toLowerCase()}`}
          message={error}
          onRetry={() => onPageChange(currentPage)}
        />
      )}

      {isLoading && <LoadingSkeleton type="card" count={pageSize} />}

      {!isLoading && !error && data.length === 0 && (
        <EmptyState
          icon={emptyStateIcon}
          title={isSearching ? "Nenhum resultado encontrado" : emptyStateTitle}
          description={isSearching ? "Tente buscar com outros termos" : emptyStateDescription}
          action={
            !isSearching ? (
              <Button variant="primary" onClick={onNewClick}>
                {buttonLabel}
              </Button>
            ) : undefined
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
            onPageChange={handlePageChangeWithScroll}
          />
        </>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmLabel="Excluir"
        variant="danger"
      />
    </>
  );
}
