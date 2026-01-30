import { useState, useEffect, useCallback } from 'react';
import { usePets } from '../hooks/usePets';
import type { Pet } from '../types/pet.types';

/**
 * PetList - Listagem de Pets com Paginação e Busca
 * 
 * Features de Nível Sênior:
 * - Grid responsivo (mobile-first)
 * - Search com debounce (500ms)
 * - Paginação conforme edital (10 items/page)
 * - Loading skeleton
 * - Empty & Error states
 * - Subscribe aos Observables via usePets hook
 * - Facade Pattern: UI → Hook → Facade → Service
 */
export const PetList = () => {
  const {
    pets,
    isLoading,
    error,
    totalCount,
    fetchPets,
    formatPetAge,
  } = usePets();

  // ✅ API usa paginação 0-indexed (page 0 = primeira página)
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const PAGE_SIZE = 10; // Conforme edital
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Debounce do search (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // ✅ Reset para página 0 (primeira página)
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ Fetch pets quando página ou busca mudar
  // CRÍTICO: Sem fetchPets nas dependências para evitar loop
  useEffect(() => {
    // Guard: previne chamadas durante loading
    if (isLoading) {
      console.log('[PetList] Skipping fetch - already loading');
      return;
    }

    const filters = debouncedSearchTerm ? { name: debouncedSearchTerm } : undefined;
    console.log('[PetList] Fetching page:', currentPage, 'filters:', filters);
    fetchPets(filters, currentPage, PAGE_SIZE);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(0); // ✅ Reset para página 0
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          🐾 Pets Cadastrados
        </h1>
        <p className="text-gray-600">
          {totalCount > 0 
            ? `${totalCount} ${totalCount === 1 ? 'pet encontrado' : 'pets encontrados'}`
            : 'Nenhum pet cadastrado'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar pet por nome..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-gray-900 focus:text-gray-900 placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {debouncedSearchTerm && (
          <p className="mt-2 text-sm text-gray-500">
            Buscando por: <span className="font-semibold">"{debouncedSearchTerm}"</span>
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <svg
              className="h-6 w-6 text-red-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Erro ao carregar pets</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchPets(
              debouncedSearchTerm ? { name: debouncedSearchTerm } : undefined,
              currentPage,
              PAGE_SIZE
            )}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-300" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && pets.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {debouncedSearchTerm
              ? `Nenhum pet encontrado com "${debouncedSearchTerm}"`
              : 'Nenhum pet cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {debouncedSearchTerm
              ? 'Tente buscar com outros termos'
              : 'Comece cadastrando o primeiro pet'}
          </p>
          {debouncedSearchTerm && (
            <button
              onClick={clearSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Limpar Busca
            </button>
          )}
        </div>
      )}

      {/* Pet Grid */}
      {!isLoading && !error && pets.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} formatAge={formatPetAge} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Info - Exibe currentPage + 1 para o usuário */}
              <div className="text-sm text-gray-600">
                Página <span className="font-semibold">{currentPage + 1}</span> de{' '}
                <span className="font-semibold">{totalPages}</span>
                {' '}({totalCount} {totalCount === 1 ? 'item' : 'itens'} no total)
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                {/* First Page - 0-indexed */}
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Primeira página"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Anterior
                </button>

                {/* Page Numbers - Mostra 1-indexed, envia 0-indexed */}
                <div className="hidden sm:flex items-center space-x-1">
                  {getPageNumbers(currentPage + 1, totalPages).map((pageNum, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum - 1)}
                      disabled={pageNum === '...'}
                      className={`px-4 py-2 border rounded-lg transition-colors font-medium ${
                        pageNum === currentPage + 1
                          ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                          : pageNum === '...'
                          ? 'border-transparent cursor-default text-gray-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Próxima
                </button>

                {/* Last Page - 0-indexed */}
                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Última página"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * PetCard - Card individual de Pet
 */
interface PetCardProps {
  pet: Pet;
  formatAge: (age?: number) => string;
}

const PetCard = ({ pet, formatAge }: PetCardProps) => {
  const getSpeciesIcon = (species: Pet['species']) => {
    const icons = {
      dog: '🐕',
      cat: '🐈',
      bird: '🐦',
      other: '🐾',
    };
    return icons[species] || icons.other;
  };

  const getSpeciesName = (species: Pet['species']) => {
    const names = {
      dog: 'Cachorro',
      cat: 'Gato',
      bird: 'Pássaro',
      other: 'Outro',
    };
    return names[species] || names.other;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">
      {/* Pet Photo */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {pet.foto?.url || pet.photo ? (
          <img
            src={pet.foto?.url || pet.photo || ''}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Fallback para ícone se imagem falhar ao carregar
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        {!pet.foto?.url && !pet.photo && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{getSpeciesIcon(pet.species)}</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {pet.vaccinated && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              💉 Vacinado
            </span>
          )}
          {pet.neutered && (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              ✂️ Castrado
            </span>
          )}
        </div>
      </div>

      {/* Pet Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate" title={pet.name}>
          {pet.name}
        </h3>

        {/* Species */}
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <span className="text-lg">{getSpeciesIcon(pet.species)}</span>
          <span className="text-sm font-medium">{getSpeciesName(pet.species)}</span>
          {pet.breed && <span className="text-xs text-gray-500">• {pet.breed}</span>}
        </div>

        {/* Age */}
        <div className="flex items-center space-x-2 text-gray-600 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">{formatAge(pet.age)}</span>
        </div>

        {/* Owner Info */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Tutor</p>
          <p className="text-sm font-medium text-gray-700 truncate" title={pet.ownerName}>
            {pet.ownerName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            Ver Detalhes
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Gera array de números de página para paginação
 * Ex: [1, 2, 3, '...', 10] ou [1, '...', 5, 6, 7, '...', 10]
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const delta = 2; // Quantas páginas mostrar ao redor da atual
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}
