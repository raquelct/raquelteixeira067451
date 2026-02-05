import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTutorFacade } from '../../facades/tutor.facade';
import { AxiosError } from 'axios';

export const useTutorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  
  const { useTutor } = useTutorFacade();
  const { data: tutor, isLoading, error: queryError, refetch } = useTutor(numericId);
  
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    if (queryError) {
      if (queryError instanceof AxiosError && queryError.response?.status === 404) {
        setNotFound(true);
      }
    }
  }, [id, queryError]);

  return {
    tutor,
    isLoading,
    error: queryError instanceof Error ? queryError.message : undefined,
    notFound,
    reload: refetch
  };
};
