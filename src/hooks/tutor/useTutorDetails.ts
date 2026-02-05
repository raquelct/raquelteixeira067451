import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tutorFacade } from '../../facades/tutor.facade';
import { useObservable } from '../useObservable';
import { AxiosError } from 'axios';

export const useTutorDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const tutor = useObservable(tutorFacade.currentTutor$, undefined);
  const isLoading = useObservable(tutorFacade.isLoading$, true);
  const error = useObservable(tutorFacade.error$, undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    tutorFacade.setCurrentTutor(undefined);

    const load = async () => {
      try {
        await tutorFacade.fetchTutorById(Number(id));
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.status === 404) {
          setNotFound(true);
        }
      }
    };

    load();

    return () => {
      tutorFacade.clear();
    };
  }, [id]);

  const reload = () => {
    if (id) {
       tutorFacade.fetchTutorById(Number(id));
    }
  };

  return {
    tutor,
    isLoading,
    error,
    notFound,
    reload
  };
};
