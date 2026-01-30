import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePets } from '../hooks/usePets';
import { GenericCard } from '../components/shared/GenericCard';
import { SearchBar } from '../components/shared/SearchBar';
import { Pagination } from '../components/shared/Pagination';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { containerStyles } from '../styles/theme';

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
  const navigate = useNavigate();
  const {
    pets,
    isLoading,
    error,
    totalCount,
    fetchPets,
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

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(0);
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <PageHeader
        title="Pets Cadastrados"
        subtitle={
          totalCount > 0 
            ? `${totalCount} ${totalCount === 1 ? 'pet encontrado' : 'pets encontrados'}`
            : 'Nenhum pet cadastrado'
        }
        icon="🐾"
        buttonLabel="Novo Pet"
        navigateTo="/pets/new"
      />

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={clearSearch}
        placeholder="Buscar pet por nome..."
        className="mb-6"
      />
      {debouncedSearchTerm && (
        <p className="mb-6 text-sm text-gray-500">
          Buscando por: <span className="font-semibold">"{debouncedSearchTerm}"</span>
        </p>
      )}

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
          <Button
            variant="danger"
            onClick={() => fetchPets(
              debouncedSearchTerm ? { name: debouncedSearchTerm } : undefined,
              currentPage,
              PAGE_SIZE
            )}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
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
            <Button
              variant="primary"
              onClick={clearSearch}
            >
              Limpar Busca
            </Button>
          )}
        </div>
      )}

      {/* Pet Grid */}
      {!isLoading && !error && pets.length > 0 && (
        <>
          <div className={containerStyles.grid}>
            {pets.map((pet) => (
              <GenericCard
                key={pet.id}
                id={pet.id}
                title={pet.name}
                subtitle={pet.breed}
                description={pet.age !== undefined ? `${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : undefined}
                imageUrl={pet.foto?.url || pet.photo}
                onViewDetails={(id) => navigate(`/pets/${id}`)}
                onEdit={(id) => navigate(`/pets/${id}/edit`)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};
