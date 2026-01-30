/**
 * LinkedPetsSection - Seção de gerenciamento de pets vinculados ao tutor
 * 
 * Features:
 * - Lista de pets vinculados ao tutor
 * - Adicionar novo vínculo (via modal/dropdown)
 * - Remover vínculo (com confirmação)
 * - Loading states
 * - Empty state quando não há pets vinculados
 * - Modo de criação (estado local) e modo de edição (API calls)
 */

import { useState, useEffect } from 'react';
import type { Pet } from '../../types/pet.types';
import type { Tutor } from '../../types/tutor.types';
import { petFacade } from '../../facades/pet.facade';
import { tutorFacade } from '../../facades/tutor.facade';
import { Button } from '../shared/Button';

interface LinkedPetsSectionProps {
  // Modo de edição: tutor existente
  tutor?: Tutor;
  onRefresh?: () => void;
  
  // Modo de criação: estado local
  mode?: 'create' | 'edit';
  selectedPets?: Pet[];
  onAddPet?: (pet: Pet) => void;
  onRemovePet?: (petId: string) => void;
}

export const LinkedPetsSection = ({ 
  tutor, 
  onRefresh,
  mode = 'edit',
  selectedPets = [],
  onAddPet,
  onRemovePet
}: LinkedPetsSectionProps) => {
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [unlinkingPetId, setUnlinkingPetId] = useState<string | null>(null);

  // Em modo 'create', usar selectedPets; em modo 'edit', usar tutor.pets
  const linkedPets = mode === 'create' ? selectedPets : (tutor?.pets || []);

  /**
   * Carrega lista de pets disponíveis quando abre o modal
   */
  useEffect(() => {
    if (!isAddingPet) return;

    const loadAvailablePets = async () => {
      try {
        setIsLoadingPets(true);
        
        // Busca todos os pets (primeira página com tamanho grande)
        const subscription = petFacade.pets$.subscribe((pets) => {
          // Filtra pets que já estão vinculados
          const linkedPetIds = linkedPets.map((p) => p.id);
          const available = pets.filter((p) => !linkedPetIds.includes(p.id));
          setAvailablePets(available);
        });

        await petFacade.fetchPets(undefined, 0, 100);

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('[LinkedPetsSection] Erro ao carregar pets:', error);
      } finally {
        setIsLoadingPets(false);
      }
    };

    loadAvailablePets();
  }, [isAddingPet, linkedPets]);

  /**
   * Vincula pet selecionado ao tutor (modo edit) ou adiciona ao estado local (modo create)
   */
  const handleLinkPet = async () => {
    if (!selectedPetId) {
      alert('Selecione um pet para vincular');
      return;
    }

    try {
      setIsLinking(true);

      if (mode === 'create') {
        // Modo criação: adiciona ao estado local
        const petToAdd = availablePets.find((p) => p.id === selectedPetId);
        if (petToAdd && onAddPet) {
          onAddPet(petToAdd);
          setIsAddingPet(false);
          setSelectedPetId('');
        }
      } else {
        // Modo edição: faz API call
        if (!tutor) {
          throw new Error('Tutor não fornecido em modo de edição');
        }
        await tutorFacade.linkPetToTutor(tutor.id, selectedPetId);
        
        // Fecha modal e reseta seleção
        setIsAddingPet(false);
        setSelectedPetId('');
        
        // Callback para refresh no componente pai
        onRefresh?.();
        
        alert('Pet vinculado com sucesso!');
      }
    } catch (error) {
      console.error('[LinkedPetsSection] Erro ao vincular pet:', error);
      alert('Erro ao vincular pet. Tente novamente.');
    } finally {
      setIsLinking(false);
    }
  };

  /**
   * Remove vínculo de pet com confirmação
   */
  const handleUnlinkPet = async (petId: string, petName: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja desvincular o pet "${petName}" deste tutor?`
    );

    if (!confirmed) return;

    try {
      setUnlinkingPetId(petId);

      if (mode === 'create') {
        // Modo criação: remove do estado local
        if (onRemovePet) {
          onRemovePet(petId);
        }
      } else {
        // Modo edição: faz API call
        if (!tutor) {
          throw new Error('Tutor não fornecido em modo de edição');
        }
        await tutorFacade.removePetFromTutor(tutor.id, petId);
        
        // Callback para refresh no componente pai
        onRefresh?.();
        
        alert('Vínculo removido com sucesso!');
      }
    } catch (error) {
      console.error('[LinkedPetsSection] Erro ao remover vínculo:', error);
      alert('Erro ao remover vínculo. Tente novamente.');
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
          onClick={() => setIsAddingPet(true)}
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
                {pet.foto?.url ? (
                  <img
                    src={pet.foto.url}
                    alt={pet.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <span className="text-xl">🐾</span>
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
                onClick={() => handleUnlinkPet(pet.id, pet.name)}
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

      {/* Modal de Adicionar Pet */}
      {isAddingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Adicionar Pet</h3>
              <button
                onClick={() => {
                  setIsAddingPet(false);
                  setSelectedPetId('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Select de Pets */}
            <div className="mb-4">
              <label htmlFor="pet-select" className="block text-sm font-medium text-gray-700 mb-2">
                Selecione um pet
              </label>
              
              {isLoadingPets ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-lg" />
                </div>
              ) : availablePets.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">Todos os pets já estão vinculados</p>
                </div>
              ) : (
                <select
                  id="pet-select"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                >
                  <option value="">-- Selecione um pet --</option>
                  {availablePets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} - {pet.breed} ({pet.age} {pet.age === 1 ? 'ano' : 'anos'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingPet(false);
                  setSelectedPetId('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleLinkPet}
                disabled={!selectedPetId || isLinking}
                loading={isLinking}
                className="flex-1"
              >
                {isLinking ? 'Vinculando...' : 'Vincular Pet'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
