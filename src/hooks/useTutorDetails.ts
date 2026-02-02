import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tutorService } from '../services/tutor.service';
import type { Tutor } from '../types/tutor.types';
import { getErrorMessage } from '../utils/errorUtils';
import { AxiosError } from 'axios';

export const useTutorDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const loadTutor = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await tutorService.getById(Number(id));
        
        if (mounted) {
          setTutor(data);
        }
      } catch (err: unknown) {
        if (mounted) {
          console.error('[useTutorDetails] Error:', err);
          if (err instanceof AxiosError && err.response?.status === 404) {
            setNotFound(true);
          } else {
            setError(getErrorMessage(err, 'Não foi possível carregar os dados do tutor.'));
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadTutor();

    return () => {
      mounted = false;
    };
  }, [id]);

  const reload = () => {
    if (id) {
       window.location.reload(); 
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
