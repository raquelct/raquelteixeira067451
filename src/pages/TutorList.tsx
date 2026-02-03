import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutores } from '../hooks/useTutores';
import { GenericCard } from '../components/shared/GenericCard';
import { ResourceList } from '../components/templates/ResourceList';
import { tutorFacade } from '../facades/tutor.facade';
import { maskCPF, maskPhone } from '../utils/masks';
import { toast } from 'react-hot-toast';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState<{id: number, name: string} | null>(null);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSearch = useCallback((term: string) => {
    const filters = term ? { nome: term } : undefined;
    setCurrentPage(0);
    fetchTutores(filters, 0, PAGE_SIZE);
  }, [fetchTutores]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchTutores(undefined, page, PAGE_SIZE);
  }, [fetchTutores]);

  useEffect(() => {
    fetchTutores(undefined, currentPage, PAGE_SIZE);
  }, [fetchTutores, currentPage]);

  return (
    <ResourceList
      title="Tutores Cadastrados"
      subtitle={totalCount > 0 ? `${totalCount} ${totalCount === 1 ? 'tutor encontrado' : 'tutores encontrados'}` : 'Nenhum tutor cadastrado'}
      icon="👥"
      buttonLabel="Novo Tutor"
      onNewClick={() => navigate('/tutores/new')}
      isLoading={isLoading}
      error={error}
      data={tutores}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      searchPlaceholder="Buscar tutor por nome..."
      emptyState={{
        title: 'Nenhum tutor cadastrado',
        description: 'Comece cadastrando um novo tutor',
      }}
      deleteModal={{
        isOpen: deleteModalOpen,
        onClose: () => {
            setDeleteModalOpen(false);
            setTutorToDelete(null);
        },
        onConfirm: async () => {
            if (tutorToDelete) {
                try {
                    await tutorFacade.deleteTutor(tutorToDelete.id);
                    toast.success('Tutor removido com sucesso!');
                    setDeleteModalOpen(false);
                    setTutorToDelete(null);
                    fetchTutores(undefined, currentPage, PAGE_SIZE);
                } catch (error) {
                    console.error('Error deleting tutor:', error);
                    toast.error('Erro ao remover tutor. Tente novamente.');
                }
            }
        },
        title: "Excluir Tutor",
        message: (
            <span>
                Tem certeza que deseja excluir o tutor <b>{tutorToDelete?.name}</b>?
                <br />
                <span className="text-sm text-red-600 mt-2 block">
                    Esta ação não pode ser desfeita e removerá todos os pets vinculados.
                </span>
            </span>
        )
      }}
      renderCard={(tutor) => (
        <GenericCard
            key={tutor.id}
            id={tutor.id}
            title={tutor.name}
            subtitle={tutor.email}
            description={maskPhone(tutor.phone)}
            imageUrl={tutor.foto?.url || tutor.photo}
            icon="👤"
            onViewDetails={(id) => navigate(`/tutores/${id}`)}
            onEdit={(id) => navigate(`/tutores/${id}/edit`)}
            onDelete={(id) => {
                setTutorToDelete({ id, name: tutor.name });
                setDeleteModalOpen(true);
            }}
            additionalInfo={
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <p>CPF: {maskCPF(tutor.cpf)}</p>
                </div>
            }
        />
      )}
    />
  );
};
