import { useState, useEffect, useCallback } from 'react';
import { tutorFacade } from '../../facades/tutor.facade';
import type { Tutor, TutorFilters, TutorFormData } from '../../types/tutor.types';

export const useTutores = () => {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [currentTutorState, setCurrentTutorState] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const tutoresSubscription = tutorFacade.tutores$.subscribe((data) => {
      setTutores(data);
    });

    const currentTutorSubscription = tutorFacade.currentTutor$.subscribe((data) => {
      setCurrentTutorState(data || null);
    });

    const loadingSubscription = tutorFacade.isLoading$.subscribe((data) => {
      setIsLoading(data);
    });

    const errorSubscription = tutorFacade.error$.subscribe((data) => {
      setError(data || null);
    });

    const totalCountSubscription = tutorFacade.totalCount$.subscribe((data) => {
      setTotalCount(data);
    });

    return () => {
      tutoresSubscription.unsubscribe();
      currentTutorSubscription.unsubscribe();
      loadingSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      totalCountSubscription.unsubscribe();
    };
  }, []);

  const fetchTutores = useCallback(
    (filters?: TutorFilters, page?: number, size?: number) => {
      return tutorFacade.fetchTutores(filters, page, size);
    },
    []
  );

  const fetchTutorById = useCallback((id: number) => {
    return tutorFacade.fetchTutorById(id);
  }, []);

  const createTutor = useCallback((data: TutorFormData, imageFile?: File) => {
    return tutorFacade.createTutor(data, imageFile);
  }, []);

  const deleteTutor = useCallback((id: number) => {
    return tutorFacade.deleteTutor(id);
  }, []);

  const setCurrentTutor = useCallback((tutor: Tutor | null) => {
    tutorFacade.setCurrentTutor(tutor || undefined);
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
