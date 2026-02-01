/**
 * Pagination - Componente de paginação reutilizável
 * 
 * Features:
 * - Navegação completa (primeira, anterior, próxima, última)
 * - Números de página com elipses (...)
 * - Responsivo (mobile e desktop)
 * - Alto contraste
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  /**
   * Gera números das páginas para exibição
   */
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const displayPage = currentPage + 1; // UI é 1-indexed
      
      if (displayPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (displayPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(displayPage - 1);
        pages.push(displayPage);
        pages.push(displayPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center mt-8 px-4 py-3 sm:px-6">
      {/* Mobile Navigation */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
        <div>
          <nav className="relative z-0 inline-flex rounded-md -space-x-px">
            {/* First Page */}
            <button
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Primeira página"
            >
              <span className="sr-only">Primeira</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="h-5 w-5 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Previous */}
            <button
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <span className="sr-only">Anterior</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum - 1) : undefined}
                disabled={typeof pageNum !== 'number'}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors ${
                  typeof pageNum === 'number' && pageNum - 1 === currentPage
                    ? 'z-10 bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${typeof pageNum !== 'number' ? 'cursor-default' : ''}`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Próxima página"
            >
              <span className="sr-only">Próxima</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Last Page */}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Última página"
            >
              <span className="sr-only">Última</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="h-5 w-5 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
