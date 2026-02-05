import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface DeleteItem {
  id: number;
  name: string;
}

interface UseDeleteConfirmationOptions {
  entityName: string;
  deleteFn: (id: number) => Promise<void>;
  onSuccess: () => void;
}

export const useDeleteConfirmation = ({
  entityName,
  deleteFn,
  onSuccess,
}: UseDeleteConfirmationOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null);

  const openModal = useCallback((item: DeleteItem) => {
    setItemToDelete(item);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setItemToDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    
    await deleteFn(itemToDelete.id);
    toast.success(`${entityName} removido com sucesso!`);
    closeModal();
    onSuccess();
  }, [itemToDelete, deleteFn, entityName, onSuccess, closeModal]);

  return {
    isOpen,
    itemToDelete,
    openModal,
    closeModal,
    confirmDelete,
  };
};
