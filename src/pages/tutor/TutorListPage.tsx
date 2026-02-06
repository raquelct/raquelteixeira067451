import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useTutores } from '../../hooks/tutor/useTutores';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { GenericCard } from '../../components/shared/GenericCard';
import { EntityList } from '../../components/shared/EntityList';

import { maskPhone } from '../../utils/masks';
import { getSubtitle } from '../../utils/formatters';
import { PAGINATION } from '../../constants/pagination';
import { ENTITY_FILTERS } from '../../constants/filters';

const TUTOR_FILTER_OPTIONS = ENTITY_FILTERS.TUTOR;
const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;

export const TutorList = () => {
  const navigate = useNavigate();
  const {
    tutores,
    isLoading,
    error,
    totalCount,
    fetchTutores,
    deleteTutor,
  } = useTutores();

  const [currentPage, setCurrentPage] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const deleteConfirmation = useDeleteConfirmation({
    entityName: 'Tutor',
    deleteFn: deleteTutor,
    onSuccess: () => fetchTutores(undefined, currentPage, PAGE_SIZE),
  });

  const handleSearch = useCallback((_filter: string, term: string) => {
    const filters = term ? { nome: term } : {};
    setIsSearching(!!term);
    setCurrentPage(0);
    fetchTutores(filters, 0, PAGE_SIZE);
  }, [fetchTutores]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchTutores(undefined, page, PAGE_SIZE);
  }, [fetchTutores]);

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
    <EntityList
      title="Tutores Cadastrados"
      subtitle={getSubtitle(totalCount, 'tutor', 'tutores')}
      icon="👥"
      buttonLabel="Novo Tutor"
      onNewClick={() => navigate('/tutores/new')}
      isLoading={isLoading}
      error={error ?? null}
      data={tutores}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      filterOptions={TUTOR_FILTER_OPTIONS}
      searchPlaceholder="Buscar tutores"
      renderCard={(tutor) => (
        <GenericCard
          key={tutor.id}
          id={tutor.id}
          title={tutor.name}
          description={maskPhone(tutor.phone)}
          descriptionIcon={<Phone className="w-3.5 h-3.5" />}
          imageUrl={tutor.foto?.url}
          icon="👤"
          onViewDetails={() => handleViewTutor(tutor.id)}
          onEdit={() => handleEditTutor(tutor.id)}
          onDelete={() => handleDeleteTutor(tutor.id, tutor.name)}
        />
      )}
      emptyStateTitle="Nenhum tutor cadastrado"
      emptyStateDescription="Comece cadastrando um novo tutor"
      emptyStateIcon={
        <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      }
      isSearching={isSearching}
      deleteModal={{
        isOpen: deleteConfirmation.isOpen,
        onClose: deleteConfirmation.closeModal,
        onConfirm: deleteConfirmation.confirmDelete,
        title: 'Excluir Tutor',
        message: deleteConfirmation.itemToDelete ? (
          <>
            Tem certeza que deseja excluir o tutor <strong>{deleteConfirmation.itemToDelete.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </>
        ) : null,
      }}
    />
  );
};
