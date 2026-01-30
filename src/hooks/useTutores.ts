import { useState, useEffect, useCallback } from 'react';
import { tutorFacade } from '../facades/tutor.facade';
import type { Tutor, TutorFilters, TutorFormData } from '../types/tutor.types';

/**
 * Hook customizado para interagir com TutorFacade
 * 
 * Encapsula:
 * - Subscriptions aos observables do Facade
 * - Estado reativo (tutores, loading, error, etc)
 * - Métodos bound do Facade (fetchTutores, createTutor, etc)
 * 
 * UI Components devem usar este hook ao invés de importar o Facade diretamente.
 */
export const useTutores = () => {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [currentTutorState, setCurrentTutorState] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Subscribe to observables on mount
  useEffect(() => {
    const tutoresSubscription = tutorFacade.tutores$.subscribe((data) => {
      setTutores(data);
    });

    const currentTutorSubscription = tutorFacade.currentTutor$.subscribe((data) => {
      setCurrentTutorState(data);
    });

    const loadingSubscription = tutorFacade.isLoading$.subscribe((data) => {
      setIsLoading(data);
    });

    const errorSubscription = tutorFacade.error$.subscribe((data) => {
      setError(data);
    });

    const totalCountSubscription = tutorFacade.totalCount$.subscribe((data) => {
      setTotalCount(data);
    });

    // Cleanup subscriptions on unmount
    return () => {
      tutoresSubscription.unsubscribe();
      currentTutorSubscription.unsubscribe();
      loadingSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      totalCountSubscription.unsubscribe();
    };
  }, []);

  // Memoize facade methods to prevent infinite re-renders
  const fetchTutores = useCallback(
    (filters?: TutorFilters, page?: number, size?: number) => {
      return tutorFacade.fetchTutores(filters, page, size);
    },
    []
  );

  const fetchTutorById = useCallback((id: string) => {
    return tutorFacade.fetchTutorById(id);
  }, []);

  const createTutor = useCallback((data: TutorFormData, imageFile?: File) => {
    return tutorFacade.createTutor(data, imageFile);
  }, []);

  const deleteTutor = useCallback((id: string) => {
    return tutorFacade.deleteTutor(id);
  }, []);

  const setCurrentTutor = useCallback((tutor: Tutor | null) => {
    tutorFacade.setCurrentTutor(tutor);
  }, []);

  const clear = useCallback(() => {
    tutorFacade.clear();
  }, []);

  return {
    tutores,
    currentTutor: currentTutorState,
    isLoading,
    error,
    totalCount,
    fetchTutores,
    fetchTutorById,
    createTutor,
    deleteTutor,
    setCurrentTutor,
    clear,
  };
};
