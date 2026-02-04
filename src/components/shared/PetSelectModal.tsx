import { useState, useEffect } from 'react';
import { petFacade } from '../../facades/pet.facade';
import type { Pet } from '../../types/pet.types';
import { GenericSelectModal } from './GenericSelectModal';

interface PetSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pet: Pet) => void;
  alreadyLinkedPetIds?: number[];
}

export const PetSelectModal = ({
  isOpen,
  onClose,
  onSelect,
  alreadyLinkedPetIds = [],
}: PetSelectModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pets on open
  useEffect(() => {
    if (isOpen) {
      const loadPets = async () => {
        try {
          setIsLoading(true);
          await petFacade.fetchPets(undefined, 0, 100);
        } catch (error) {
            console.error('Erro ao carregar pets', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadPets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const sub = petFacade.pets$.subscribe((allPets) => {
      setPets(allPets);
    });
    return () => sub.unsubscribe();
  }, [isOpen]);

  const filteredPets = pets.filter((pet) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = pet.name.toLowerCase().includes(term);
    const isAlreadyLinked = alreadyLinkedPetIds.includes(pet.id);
    return matchesSearch && !isAlreadyLinked;
  });

  return (
    <GenericSelectModal<Pet>
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Pet"
      items={filteredPets}
      onSearch={setSearchTerm}
      onSelect={onSelect}
      isLoading={isLoading}
      searchPlaceholder="Buscar pet por nome..."
      emptyMessage={searchTerm ? 'Nenhum pet encontrado.' : 'Nenhum pet disponível.'}
      renderItem={(pet) => (
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-50">
            {pet.photoUrl ? (
               <img 
                 src={pet.photoUrl} 
                 alt="" 
                 aria-hidden="true" 
                 className="h-full w-full object-cover" 
               />
            ) : (
                <span className="text-lg" aria-hidden="true">🐾</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{pet.name}</p>
            <p className="text-sm text-gray-500 truncate">{pet.breed || 'Raça não informada'}</p>
          </div>
        </div>
      )}
    />
  );
};
