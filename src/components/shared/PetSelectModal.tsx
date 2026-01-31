import { useState, useEffect } from 'react';
import { petFacade } from '../../facades/pet.facade';
import type { Pet } from '../../types/pet.types';
import { Button } from './Button';
import { FormInput } from './FormInput';

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

  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Carrega pets ao abrir
  useEffect(() => {
    if (isOpen) {
      loadPets();
    }
  }, [isOpen]);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      // Busca uma lista inicial grande para seleção (idealmente seria paginado ou busca server-side)
      // Aqui usamos a busca client-side no array retornado para simplificar conforme o requisito
      // Mas o facade tem fetchPets. Vamos usar o observable ou fetch direto?
      // O requisito diz: "Buscar todos os pets via PetFacade"
      await petFacade.fetchPets(undefined, 0, 100); 
    } catch (error) {
      console.error('Erro ao carregar pets para seleção', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe aos pets do facade
  useEffect(() => {
    if (!isOpen) return;
    const sub = petFacade.pets$.subscribe((allPets) => {
      setPets(allPets);
    });
    return () => sub.unsubscribe();
  }, [isOpen]);

  const filteredPets = pets.filter((pet) => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isAlreadyLinked = alreadyLinkedPetIds.includes(pet.id);
    return matchesSearch && !isAlreadyLinked;
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Selecionar Pet</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <FormInput
            label=""
            placeholder="Buscar pet por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-0"
            autoFocus
          />
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {isLoading ? (
             <div className="flex justify-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum pet encontrado.' : 'Nenhum pet disponível.'}
            </div>
          ) : (
            filteredPets.map((pet) => (
              <div 
                key={pet.id} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                    {pet.foto?.url || pet.photo ? (
                      <img src={pet.foto?.url || pet.photo} alt={pet.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">🐾</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{pet.name}</p>
                    <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelect(pet);
                    onClose();
                  }}
                >
                  Selecionar
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
