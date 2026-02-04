import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutores } from '../hooks/useTutores';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { GenericCard } from '../components/shared/GenericCard';
import { SearchFilter } from '../components/shared/SearchFilter';
import { PageHeader } from '../components/shared/PageHeader';
import { Pagination } from '../components/shared/Pagination';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorState } from '../components/shared/ErrorState';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { Button } from '../components/shared/Button';
import { tutorFacade } from '../facades/tutor.facade';
import { maskPhone } from '../utils/masks';
import { getSubtitle } from '../utils/formatters';
import { containerStyles } from '../styles/theme';

const TUTOR_FILTER_OPTIONS = [
  { label: 'Nome', value: 'nome' }
] as const;

const PAGE_SIZE = 10;

export const TutorList = () => {
  const navigate = useNavigate();
  const {
    tutores,
    isLoading,
    error,
    totalCount,
    fetchTutores,
  } = useTutores();

  const [currentPage, setCurrentPage] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const deleteConfirmation = useDeleteConfirmation({
    entityName: 'Tutor',
    deleteFn: tutorFacade.deleteTutor,
    onSuccess: () => fetchTutores(undefined, currentPage, PAGE_SIZE),
  });

  const handleSearch = useCallback((_filter: string, term: string) => {
    const filters = term ? { nome: term } : undefined;
    setIsSearching(!!term);
    setCurrentPage(0);
    fetchTutores(filters, 0, PAGE_SIZE);
  }, [fetchTutores]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchTutores(undefined, page, PAGE_SIZE);
  }, [fetchTutores]);

  const handlePageChangeWithScroll = useCallback((page: number) => {
    handlePageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handlePageChange]);

  const handleViewTutor = useCallback((id: number) => {
    navigate(`/tutores/${id}`);
  }, [navigate]);

  const handleEditTutor = useCallback((id: number) => {
    navigate(`/tutores/${id}/edit`);
  }, [navigate]);

  const handleDeleteTutor = useCallback((id: number, name: string) => {
    deleteConfirmation.openModal({ id, name });
  }, [deleteConfirmation]);

  useEffect(() => {
    fetchTutores(undefined, currentPage, PAGE_SIZE);
  }, [fetchTutores, currentPage]);

  return (
    <div className="w-full">
      <PageHeader
        title="Tutores Cadastrados"
        subtitle={getSubtitle(totalCount, 'tutor', 'tutores')}
        icon="👥"
        buttonLabel="Novo Tutor"
        onButtonClick={() => navigate('/tutores/new')}
      />

      <div className="max-full mb-6 flex justify-center">
        <SearchFilter
          options={TUTOR_FILTER_OPTIONS}
          onSearch={handleSearch}
          placeholder="Buscar tutores..."
        />
      </div>

      {error && (
        <ErrorState
          title="Erro ao carregar tutores"
          message={error}
          onRetry={() => fetchTutores(undefined, currentPage, PAGE_SIZE)}
        />
      )}

      {isLoading && <LoadingSkeleton type="card" count={PAGE_SIZE} />}

      {!isLoading && !error && tutores.length === 0 && (
        <EmptyState
          icon={
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title={isSearching ? "Nenhum resultado encontrado" : "Nenhum tutor cadastrado"}
          description={isSearching ? "Tente buscar com outros termos" : "Comece cadastrando um novo tutor"}
          action={
            !isSearching ? (
              <Button variant="primary" onClick={() => navigate('/tutores/new')}>
                Novo Tutor
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !error && tutores.length > 0 && (
        <>
          <div className={containerStyles.grid}>
            {tutores.map((tutor) => (
              <GenericCard
                key={tutor.id}
                id={tutor.id}
                title={tutor.name}
                description={maskPhone(tutor.phone)}
                imageUrl={tutor.foto?.url}
                icon="👤"
                onViewDetails={() => handleViewTutor(tutor.id)}
                onEdit={() => handleEditTutor(tutor.id)}
                onDelete={() => handleDeleteTutor(tutor.id, tutor.name)}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChangeWithScroll}
          />
        </>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={deleteConfirmation.closeModal}
        onConfirm={deleteConfirmation.confirmDelete}
        title="Excluir Tutor"
        message={
          deleteConfirmation.itemToDelete ? (
            <>
              Tem certeza que deseja excluir o tutor <strong>{deleteConfirmation.itemToDelete.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </>
          ) : null
        }
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
};
