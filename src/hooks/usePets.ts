import { useState, useEffect, useCallback } from 'react';
import { petFacade } from '../facades/pet.facade';
import { petStore } from '../state/PetStore';
import type { Pet, PetFilters } from '../types/pet.types';

export const usePets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPetState] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const petsSubscription = petFacade.pets$.subscribe((data) => {
      setPets(data);
    });

    const currentPetSubscription = petFacade.currentPet$.subscribe((data) => {
      setCurrentPetState(data ?? null);
    });

    const loadingSubscription = petFacade.isLoading$.subscribe((data) => {
      setIsLoading(data);
    });

    const errorSubscription = petFacade.error$.subscribe((data) => {
      setError(data ?? null);
    });

    const totalCountSubscription = petFacade.totalCount$.subscribe((data) => {
      setTotalCount(data);
    });

    const currentPageSubscription = petStore.currentPage$.subscribe((data) => {
      setCurrentPage(data);
    });

    const pageSizeSubscription = petStore.pageSize$.subscribe((data) => {
      setPageSize(data);
    });

    return () => {
      petsSubscription.unsubscribe();
      currentPetSubscription.unsubscribe();
      loadingSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      totalCountSubscription.unsubscribe();
      currentPageSubscription.unsubscribe();
      pageSizeSubscription.unsubscribe();
    };
  }, []);

  const fetchPets = useCallback(
    (filters?: PetFilters, page?: number, size?: number) => {
      return petFacade.fetchPets(filters, page, size);
    },
    []
  );

  const fetchPetById = useCallback((id: number) => {
    return petFacade.fetchPetById(id);
  }, []);


  const createPet = useCallback((data: Parameters<typeof petFacade.createPet>[0]) => {
    return petFacade.createPet(data);
  }, []);

  const updatePet = useCallback(
    (id: number, data: Parameters<typeof petFacade.updatePet>[1]) => {
      return petFacade.updatePet(id, data);
    },
    []
  );

  const deletePet = useCallback((id: number) => {
    return petFacade.deletePet(id);
  }, []);

  const setCurrentPet = useCallback((pet: Pet | null) => {
    petFacade.setCurrentPet(pet ?? undefined);
  }, []);

  const clear = useCallback(() => {
    petFacade.clear();
  }, []);

  const formatPetAge = useCallback((age?: number) => {
    return petFacade.formatPetAge(age);
  }, []);


  return {
    pets,
    currentPet,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    fetchPets,
    fetchPetById,
    createPet,
    updatePet,
    deletePet,
    setCurrentPet,
    clear,
    formatPetAge,
  };
};
