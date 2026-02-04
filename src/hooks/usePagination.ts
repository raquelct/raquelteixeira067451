import { useMemo } from 'react';

export const usePagination = (currentPage: number, totalPages: number) => {
  return useMemo(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const displayPage = currentPage + 1;

    if (displayPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    
    if (displayPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', displayPage - 1, displayPage, displayPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);
};
