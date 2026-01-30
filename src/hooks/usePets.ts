import { useState, useEffect, useCallback } from 'react';
import { petFacade } from '../facades/pet.facade';
import type { Pet, PetFilters } from '../types/pet.types';

/**
 * Hook customizado para gerenciar pets
 * 
 * IMPORTANTE: Este hook demonstra o uso CORRETO da arquitetura.
 * - NÃO importa axios
 * - NÃO importa PetService
 * - USA APENAS PetFacade
 * - Subscribe aos Observables do Facade
 * - Métodos memoizados com useCallback para evitar loops
 * 
 * UI Components devem seguir este padrão.
 */
export const usePets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPetState] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Subscribe aos observables do PetFacade
    const petsSubscription = petFacade.pets$.subscribe((data) => {
      setPets(data);
    });

    const currentPetSubscription = petFacade.currentPet$.subscribe((data) => {
      setCurrentPetState(data);
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

  // ========== Métodos Memoizados ==========
  // CRÍTICO: useCallback previne loops infinitos em useEffect

  const fetchPets = useCallback(
    (filters?: PetFilters, page?: number, size?: number) => {
      return petFacade.fetchPets(filters, page, size);
    },
    []
  );

  const fetchPetById = useCallback((id: string) => {
    return petFacade.fetchPetById(id);
  }, []);

  const fetchPetsByTutor = useCallback((cpf: string) => {
    return petFacade.fetchPetsByTutor(cpf);
  }, []);

  const createPet = useCallback((data: Parameters<typeof petFacade.createPet>[0]) => {
    return petFacade.createPet(data);
  }, []);

  const updatePet = useCallback(
    (id: string, data: Parameters<typeof petFacade.updatePet>[1]) => {
      return petFacade.updatePet(id, data);
    },
    []
  );

  const deletePet = useCallback((id: string) => {
    return petFacade.deletePet(id);
  }, []);

  const setCurrentPet = useCallback((pet: Pet | null) => {
    petFacade.setCurrentPet(pet);
  }, []);

  const clear = useCallback(() => {
    petFacade.clear();
  }, []);

  const formatPetAge = useCallback((age?: number) => {
    return petFacade.formatPetAge(age);
  }, []);

  const formatPetWeight = useCallback((weight?: number) => {
    return petFacade.formatPetWeight(weight);
  }, []);

  return {
    // Estado reativo
    pets,
    currentPet,
    isLoading,
    error,
    totalCount,
    
    // Métodos memoizados (previnem loops)
    fetchPets,
    fetchPetById,
    fetchPetsByTutor,
    createPet,
    updatePet,
    deletePet,
    setCurrentPet,
    clear,
    
    // Helpers de formatação
    formatPetAge,
    formatPetWeight,
  };
};
