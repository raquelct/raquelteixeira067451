import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePets } from '../hooks/usePets';
import { GenericCard } from '../components/shared/GenericCard';
import { ResourceList } from '../components/templates/ResourceList';
import { petFacade } from '../facades/pet.facade';
import { toast } from 'react-hot-toast';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<{id: number, name: string} | null>(null);

  const PAGE_SIZE = 10; 
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSearch = useCallback((term: string) => {
    const filters = term ? { name: term } : undefined;
    // Reset page to 0 on new search
    setCurrentPage(0); 
    fetchPets(filters, 0, PAGE_SIZE);
  }, [fetchPets]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchPets(undefined, page, PAGE_SIZE); // Note: We might need to persist generic filters if we add them later
  }, [fetchPets]);

  useEffect(() => {
     // Initial load
     fetchPets(undefined, currentPage, PAGE_SIZE);
  }, [fetchPets, currentPage]);


  return (
    <ResourceList
      title="Pets Cadastrados"
      subtitle={totalCount > 0 ? `${totalCount} ${totalCount === 1 ? 'pet encontrado' : 'pets encontrados'}` : 'Nenhum pet cadastrado'}
      icon="🐾"
      buttonLabel="Novo Pet"
      onNewClick={() => navigate('/pets/new')}
      isLoading={isLoading}
      error={error}
      data={pets}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      searchPlaceholder="Buscar pet por nome..."
      emptyState={{
        title: 'Nenhum pet cadastrado',
        description: 'Comece cadastrando o primeiro pet',
      }}
      deleteModal={{
        isOpen: deleteModalOpen,
        onClose: () => {
            setDeleteModalOpen(false);
            setPetToDelete(null);
        },
        onConfirm: async () => {
            if (petToDelete) {
                try {
                    await petFacade.deletePet(petToDelete.id);
                    toast.success('Pet removido com sucesso!');
                    setDeleteModalOpen(false);
                    setPetToDelete(null);
                    // Refresh
                    fetchPets(undefined, currentPage, PAGE_SIZE);
                } catch (error) {
                    console.error('Error deleting pet:', error);
                    toast.error('Erro ao remover pet. Tente novamente.');
                }
            }
        },
        title: "Excluir Pet",
        message: (
            <span>
                Tem certeza que deseja excluir o pet <b>{petToDelete?.name}</b>?
                <br />
                <span className="text-sm text-red-600 mt-2 block">
                    Esta ação não pode ser desfeita.
                </span>
            </span>
        )
      }}
      renderCard={(pet) => (
        <GenericCard
            key={pet.id}
            id={pet.id}
            title={pet.name}
            subtitle={pet.breed}
            description={pet.age !== undefined ? `${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : undefined}
            imageUrl={pet.photoUrl}
            icon="🐾"
            onViewDetails={(id) => navigate(`/pets/${id}`)}
            onEdit={(id) => navigate(`/pets/${id}/edit`)}
            onDelete={(id) => {
                setPetToDelete({ id, name: pet.name });
                setDeleteModalOpen(true);
            }}
        />
      )}
    />
  );
};
