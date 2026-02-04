import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePets } from '../hooks/usePets';
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
import { petFacade } from '../facades/pet.facade';
import { getSubtitle } from '../utils/formatters';
import { containerStyles } from '../styles/theme';
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

  const handlePageChangeWithScroll = useCallback((page: number) => {
    handlePageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handlePageChange]);

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
    <>
      <PageHeader
        title="Pets Cadastrados"
        subtitle={getSubtitle(totalCount, 'pet', 'pets')}
        icon="🐾"
        buttonLabel="Novo Pet"
        onButtonClick={() => navigate('/pets/new')}
      />

      <div className="max-full mb-6 flex justify-center">
        <SearchFilter
          options={PET_FILTER_OPTIONS}
          onSearch={handleSearch}
          placeholder="Buscar pets"
        />
      </div>

      {error && (
        <ErrorState
          title="Erro ao carregar pets"
          message={error}
          onRetry={() => fetchPets(undefined, currentPage, PAGE_SIZE)}
        />
      )}

      {isLoading && <LoadingSkeleton type="card" count={PAGE_SIZE} />}

      {!isLoading && !error && pets.length === 0 && (
        <EmptyState
          icon={
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          }
          title={isSearching ? "Nenhum resultado encontrado" : "Nenhum pet cadastrado"}
          description={isSearching ? "Tente buscar com outros termos" : "Comece cadastrando o primeiro pet"}
          action={
            !isSearching ? (
              <Button variant="primary" onClick={() => navigate('/pets/new')}>
                Novo Pet
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !error && pets.length > 0 && (
        <>
          <div className={containerStyles.grid}>
            {pets.map((pet) => (
              <GenericCard
                key={pet.id}
                id={pet.id}
                title={pet.name}
                subtitle={pet.breed || 'Sem raça definida'}
                description={`${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}`}
                imageUrl={pet.photoUrl}
                icon="🐾"
                onViewDetails={() => handleViewPet(pet.id)}
                onEdit={() => handleEditPet(pet.id)}
                onDelete={() => handleDeletePet(pet.id, pet.name)}
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
        title="Excluir Pet"
        message={
          deleteConfirmation.itemToDelete ? (
            <>
              Tem certeza que deseja excluir o pet <strong>{deleteConfirmation.itemToDelete.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </>
          ) : null
        }
        confirmLabel="Excluir"
        variant="danger"
      />
    </>
  );
};
