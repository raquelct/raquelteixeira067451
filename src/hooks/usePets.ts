import { useState, useEffect } from 'react';
import { petFacade } from '../facades/pet.facade';
import type { Pet } from '../types/pet.types';

/**
 * Hook customizado para gerenciar pets
 * 
 * IMPORTANTE: Este hook demonstra o uso CORRETO da arquitetura.
 * - NÃO importa axios
 * - NÃO importa PetService
 * - USA APENAS PetFacade
 * - Subscribe aos Observables do Facade
 * 
 * UI Components devem seguir este padrão.
 */
export const usePets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Subscribe aos observables do PetFacade
    const petsSubscription = petFacade.pets$.subscribe((data) => {
      setPets(data);
    });

    const currentPetSubscription = petFacade.currentPet$.subscribe((data) => {
      setCurrentPet(data);
    });

    const loadingSubscription = petFacade.isLoading$.subscribe((data) => {
      setIsLoading(data);
    });

    const errorSubscription = petFacade.error$.subscribe((data) => {
      setError(data);
    });

    const totalCountSubscription = petFacade.totalCount$.subscribe((data) => {
      setTotalCount(data);
    });

    // Cleanup: Unsubscribe ao desmontar
    return () => {
      petsSubscription.unsubscribe();
      currentPetSubscription.unsubscribe();
      loadingSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      totalCountSubscription.unsubscribe();
    };
  }, []);

  return {
    // Estado reativo
    pets,
    currentPet,
    isLoading,
    error,
    totalCount,
    
    // Métodos do Facade (expostos diretamente)
    fetchPets: petFacade.fetchPets.bind(petFacade),
    fetchPetById: petFacade.fetchPetById.bind(petFacade),
    fetchPetsByTutor: petFacade.fetchPetsByTutor.bind(petFacade),
    createPet: petFacade.createPet.bind(petFacade),
    updatePet: petFacade.updatePet.bind(petFacade),
    deletePet: petFacade.deletePet.bind(petFacade),
    setCurrentPet: petFacade.setCurrentPet.bind(petFacade),
    clear: petFacade.clear.bind(petFacade),
    
    // Helpers de formatação
    formatPetAge: petFacade.formatPetAge.bind(petFacade),
    formatPetWeight: petFacade.formatPetWeight.bind(petFacade),
  };
};
