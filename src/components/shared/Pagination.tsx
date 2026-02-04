import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const PaginationButton = ({ active, className = '', ...props }: PaginationButtonProps) => (
  <button 
    className={`
      relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md
      ${active 
        ? 'z-10 bg-indigo-50 text-indigo-600 border border-indigo-100' 
        : 'text-gray-700 hover:bg-gray-100'
      }
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
    {...props} 
  />
);

const NavigationButton = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`
      relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pages = usePagination(currentPage, totalPages);

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
          <nav className="relative z-0 inline-flex rounded-md -space-x-px gap-1" aria-label="Pagination">
            {/* First Page */}
            <NavigationButton
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              title="Primeira página"
              className="rounded-l-md"
            >
              <span className="sr-only">Primeira</span>
              <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
            </NavigationButton>

            {/* Previous */}
            <NavigationButton
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              title="Página anterior"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </NavigationButton>

            {/* Page Numbers */}
            {pages.map((pageNum, index) => (
              <PaginationButton
                key={index}
                active={typeof pageNum === 'number' && pageNum - 1 === currentPage}
                onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum - 1) : undefined}
                disabled={typeof pageNum !== 'number'}
                aria-current={typeof pageNum === 'number' && pageNum - 1 === currentPage ? 'page' : undefined}
                className={typeof pageNum !== 'number' ? 'cursor-default border-none hover:bg-transparent' : ''}
              >
                {pageNum}
              </PaginationButton>
            ))}

            {/* Next */}
            <NavigationButton
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              title="Próxima página"
            >
              <span className="sr-only">Próxima</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </NavigationButton>

            {/* Last Page */}
            <NavigationButton
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              title="Última página"
              className="rounded-r-md"
            >
              <span className="sr-only">Última</span>
              <ChevronsRight className="h-5 w-5" aria-hidden="true" />
            </NavigationButton>
          </nav>
        </div>
      </div>
    </div>
  );
};
