import { useState, useEffect } from 'react';
import { tutorFacade } from '../facades/tutor.facade';
import type { Tutor } from '../types/tutor.types';

/**
 * Hook customizado para gerenciar tutores
 * 
 * IMPORTANTE: Este hook demonstra o uso CORRETO da arquitetura.
 * - NÃO importa axios
 * - NÃO importa TutorService
 * - USA APENAS TutorFacade
 * - Subscribe aos Observables do Facade
 * 
 * UI Components devem seguir este padrão.
 */
export const useTutores = () => {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [currentTutor, setCurrentTutor] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Subscribe aos observables do TutorFacade
    const tutoresSubscription = tutorFacade.tutores$.subscribe((data) => {
      setTutores(data);
    });

    const currentTutorSubscription = tutorFacade.currentTutor$.subscribe((data) => {
      setCurrentTutor(data);
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

    // Cleanup: Unsubscribe ao desmontar
    return () => {
      tutoresSubscription.unsubscribe();
      currentTutorSubscription.unsubscribe();
      loadingSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      totalCountSubscription.unsubscribe();
    };
  }, []);

  return {
    // Estado reativo
    tutores,
    currentTutor,
    isLoading,
    error,
    totalCount,
    
    // Métodos do Facade (expostos diretamente)
    fetchTutores: tutorFacade.fetchTutores.bind(tutorFacade),
    fetchTutorById: tutorFacade.fetchTutorById.bind(tutorFacade),
    fetchTutorByCpf: tutorFacade.fetchTutorByCpf.bind(tutorFacade),
    createTutor: tutorFacade.createTutor.bind(tutorFacade),
    updateTutor: tutorFacade.updateTutor.bind(tutorFacade),
    deleteTutor: tutorFacade.deleteTutor.bind(tutorFacade),
    toggleTutorActive: tutorFacade.toggleTutorActive.bind(tutorFacade),
    setCurrentTutor: tutorFacade.setCurrentTutor.bind(tutorFacade),
    clear: tutorFacade.clear.bind(tutorFacade),
    
    // Helpers de formatação
    formatCpf: tutorFacade.formatCpf.bind(tutorFacade),
    formatPhone: tutorFacade.formatPhone.bind(tutorFacade),
    formatZipCode: tutorFacade.formatZipCode.bind(tutorFacade),
    formatAddress: tutorFacade.formatAddress.bind(tutorFacade),
  };
};
