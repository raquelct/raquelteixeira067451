import { useState, useMemo } from 'react';
import type { Pet } from '../../types/pet.types';
import type { Tutor } from '../../types/tutor.types';
import { tutorFacade } from '../../facades/tutor.facade';
import { Button } from '../shared/Button';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import toast from 'react-hot-toast';

interface LinkedPetsSectionProps {
  tutor?: Tutor;
  onRefresh?: () => void;
  mode?: 'create' | 'edit';
  selectedPets?: Pet[];
  onAddPet?: (pet: Pet) => void;
  onRemovePet?: (petId: number) => void;
  onAddClick?: () => void;
}

export const LinkedPetsSection = ({
  tutor,
  mode = 'edit',
  selectedPets = [],
  onRemovePet,
  onAddClick
}: LinkedPetsSectionProps) => {
  const [unlinkingPetId, setUnlinkingPetId] = useState<number | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    petId: number;
    petName: string;
  }>({
    isOpen: false,
    petId: 0,
    petName: '',
  });

  const linkedPets = useMemo(() => {
    return selectedPets !== undefined 
      ? selectedPets 
      : (tutor?.pets || []);
  }, [selectedPets, tutor?.pets]);

  const handleUnlinkPetClick = (petId: number, petName: string) => {
    setConfirmModal({
      isOpen: true,
      petId,
      petName,
    });
  };


  const handleConfirmUnlink = async () => {
    const { petId } = confirmModal;

    try {
      setUnlinkingPetId(petId);
      setConfirmModal({ isOpen: false, petId: 0, petName: '' });

      if (mode === 'create') {
        if (onRemovePet) {
          onRemovePet(petId);
        }
      } else {
        if (!tutor) {
          throw new Error('Tutor não fornecido em modo de edição');
        }

        await tutorFacade.removePetFromTutor(tutor.id, petId);

        if (onRemovePet) {
          onRemovePet(petId);
        }
      }
    } catch (error) {
      console.error('[LinkedPetsSection] Erro ao remover vínculo:', error);
      toast.error('Erro ao remover vínculo. Tente novamente.');
      
    } finally {
      setUnlinkingPetId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Pets Vinculados</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {linkedPets.length}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddClick}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
          className="w-full"
        >
          Adicionar Pet
        </Button>
      </div>

      {/* Lista de Pets Vinculados */}
      {linkedPets.length === 0 ? (
        <div className="text-center py-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
            />
          </svg>
          <p className="text-gray-500 text-sm">Nenhum pet vinculado a este tutor</p>
          <p className="text-gray-400 text-xs mt-0.5">Clique em "Adicionar Pet" para vincular</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {linkedPets.map((pet) => (
            <div
              key={pet.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all bg-white"
            >
              {/* Imagem do Pet */}
              <div className="flex-shrink-0">
                {pet.photoUrl ? (
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  </div>
                )}
              </div>

              {/* Info do Pet */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate" title={pet.name}>
                  {pet.name}
                </h3>
                <p className="text-sm text-gray-600 truncate" title={pet.breed}>
                  {pet.breed}
                </p>
              </div>

              {/* Botão Remover */}
              <button
                onClick={() => handleUnlinkPetClick(pet.id, pet.name)}
                disabled={unlinkingPetId === pet.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                title="Remover vínculo"
                aria-label={`Remover ${pet.name}`}
              >
                {unlinkingPetId === pet.id ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação para Desvincular */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, petId: 0, petName: '' })}
        onConfirm={handleConfirmUnlink}
        title="Desvincular Pet"
        message={
          <>
            Tem certeza que deseja desvincular o pet{' '}
            <strong>"{confirmModal.petName}"</strong> deste tutor?
          </>
        }
        confirmLabel="Desvincular"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={unlinkingPetId === confirmModal.petId}
      />
    </div>
  );
};
