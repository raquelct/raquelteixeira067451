import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { petFacade } from '../../facades/pet.facade';
import { useObservable } from '../../hooks/useObservable';
import { AxiosError } from 'axios';

export const usePetDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const pet = useObservable(petFacade.currentPet$, undefined);
  const isLoading = useObservable(petFacade.isLoading$, true);
  const error = useObservable(petFacade.error$, undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    // Reset current pet when mounting/id changes
    petFacade.setCurrentPet(undefined);

    const load = async () => {
      try {
        await petFacade.fetchPetById(Number(id));
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.status === 404) {
          setNotFound(true);
        }
        // Other errors handled by interceptor/facade
      }
    };

    load();

    return () => {
      petFacade.clear();
    };
  }, [id]);

  const reload = () => {
    if (id) {
       petFacade.fetchPetById(Number(id));
    }
  };

  return {
    pet,
    isLoading,
    error,
    notFound,
    reload
  };
};
