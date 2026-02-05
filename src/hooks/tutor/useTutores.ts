import { useState, useCallback } from 'react';
import { useTutorFacade } from '../../facades/tutor.facade';
import type { TutorFilters } from '../../types/tutor.types';

export const useTutores = () => {
  const { useTutors: useTutorsQuery, createTutor, updateTutor, deleteTutor } = useTutorFacade();
  
  const [filters, setFilters] = useState<TutorFilters | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data, isLoading, error } = useTutorsQuery(filters, page, size);

  const fetchTutores = useCallback((newFilters?: TutorFilters, newPage?: number, newSize?: number) => {
    if (newFilters !== undefined) setFilters(newFilters);
    if (newPage !== undefined) setPage(newPage);
    if (newSize !== undefined) setSize(newSize);
  }, []);

  return {
    tutores: data?.content || [],
    isLoading,
    error: error instanceof Error ? error.message : undefined,
    totalCount: data?.total || 0,
    currentPage: page,
    pageSize: size,
    fetchTutores,
    createTutor,
    updateTutor,
    deleteTutor,
  };
};
