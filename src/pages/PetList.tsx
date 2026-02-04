import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { usePets } from '../hooks/usePets';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { GenericCard } from '../components/shared/GenericCard';
import { EntityList } from '../components/shared/EntityList';
import { petFacade } from '../facades/pet.facade';
import { getSubtitle, formatAge } from '../utils/formatters';
import { PAGINATION } from '../constants/pagination';
import { ENTITY_FILTERS } from '../constants/filters';

const PET_FILTER_OPTIONS = ENTITY_FILTERS.PET;
const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;

export const PetList = () => {
  const navigate = useNavigate();
  const {
    pets,
    isLoading,
    error,
    totalCount,
    fetchPets,
  } = usePets();

  const [currentPage, setCurrentPage] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const deleteConfirmation = useDeleteConfirmation({
    entityName: 'Pet',
    deleteFn: petFacade.deletePet,
    onSuccess: () => fetchPets(undefined, currentPage, PAGE_SIZE),
  });

  const handleSearch = useCallback((filter: string, term: string) => {
    const filters = term ? { [filter]: term } : undefined;
    setIsSearching(!!term);
    setCurrentPage(0);
    fetchPets(filters, 0, PAGE_SIZE);
  }, [fetchPets]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchPets(undefined, page, PAGE_SIZE);
  }, [fetchPets]);

  const handleViewPet = useCallback((id: number) => {
    navigate(`/pets/${id}`);
  }, [navigate]);

  const handleEditPet = useCallback((id: number) => {
    navigate(`/pets/${id}/edit`);
  }, [navigate]);

  const handleDeletePet = useCallback((id: number, name: string) => {
    deleteConfirmation.openModal({ id, name });
  }, [deleteConfirmation]);

  useEffect(() => {
    fetchPets(undefined, currentPage, PAGE_SIZE);
  }, [fetchPets, currentPage]);

  return (
    <EntityList
      title="Pets Cadastrados"
      subtitle={getSubtitle(totalCount, 'pet', 'pets')}
      icon="🐾"
      buttonLabel="Novo Pet"
      onNewClick={() => navigate('/pets/new')}
      isLoading={isLoading}
      error={error}
      data={pets}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      filterOptions={PET_FILTER_OPTIONS}
      searchPlaceholder="Buscar pets"
      renderCard={(pet) => (
        <GenericCard
          key={pet.id}
          id={pet.id}
          title={pet.name}
          description={formatAge(pet.age)}
          descriptionIcon={<Calendar className="w-3.5 h-3.5" />}
          imageUrl={pet.photoUrl}
          icon="🐾"
          onViewDetails={() => handleViewPet(pet.id)}
          onEdit={() => handleEditPet(pet.id)}
          onDelete={() => handleDeletePet(pet.id, pet.name)}
        />
      )}
      emptyStateTitle="Nenhum pet cadastrado"
      emptyStateDescription="Comece cadastrando o primeiro pet"
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
        title: 'Excluir Pet',
        message: deleteConfirmation.itemToDelete ? (
          <>
            Tem certeza que deseja excluir o pet <strong>{deleteConfirmation.itemToDelete.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </>
        ) : null,
      }}
    />
  );
};
