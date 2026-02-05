import { useState, useCallback } from 'react';
import { usePetFacade } from '../../facades/pet.facade';
import type { PetFilters } from '../../types/pet.types';

export const usePets = () => {
  const { usePets: usePetsQuery, createPet, updatePet, deletePet } = usePetFacade();
  
  const [filters, setFilters] = useState<PetFilters | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data, isLoading, error } = usePetsQuery(filters, page, size);

  const fetchPets = useCallback((newFilters?: PetFilters, newPage?: number, newSize?: number) => {
    if (newFilters !== undefined) setFilters(newFilters);
    if (newPage !== undefined) setPage(newPage);
    if (newSize !== undefined) setSize(newSize);
  }, []);

  return {
    pets: data?.content || [],
    isLoading,
    error: error instanceof Error ? error.message : undefined,
    totalCount: data?.total || 0,
    currentPage: page,
    pageSize: size,
    fetchPets,
    createPet,
    updatePet,
    deletePet,
  };
};
