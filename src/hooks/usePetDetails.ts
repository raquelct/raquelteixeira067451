import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { petService } from '../services/pet.service';
import type { Pet } from '../types/pet.types';
import { getErrorMessage } from '../utils/errorUtils';

export const usePetDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const [pet, setPet] = useState<Pet | null>(null);
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

    const loadPet = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await petService.getById(Number(id));
        
        if (mounted) {
          setPet(data);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[usePetDetails] Error:', err);
          if (err.response?.status === 404) {
            setNotFound(true);
          } else {
            setError(getErrorMessage(err, 'Não foi possível carregar os dados do pet.'));
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadPet();

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
    pet,
    isLoading,
    error,
    notFound,
    reload
  };
};
