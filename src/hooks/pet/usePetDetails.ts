import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePetFacade } from '../../facades/pet.facade';
import { AxiosError } from 'axios';

export const usePetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  
  const { usePet } = usePetFacade();
  const { data: pet, isLoading, error: queryError, refetch } = usePet(numericId);
  
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
    pet,
    isLoading,
    error: queryError instanceof Error ? queryError.message : undefined,
    notFound,
    reload: refetch
  };
};
