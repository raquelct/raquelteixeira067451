import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePets } from '../hooks/usePets';
import { GenericCard } from '../components/shared/GenericCard';
import { SearchBar } from '../components/shared/SearchBar';
import { Pagination } from '../components/shared/Pagination';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorState } from '../components/shared/ErrorState';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { containerStyles } from '../styles/theme';
import { petFacade } from '../facades/pet.facade';

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
      return;
    }

    const filters = debouncedSearchTerm ? { name: debouncedSearchTerm } : undefined;
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
      <div className="max-w-2xl mx-auto mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={clearSearch}
          placeholder="Buscar pet por nome..."
          className="w-full"
        />
      </div>
      {debouncedSearchTerm && (
        <p className="mb-6 text-sm text-gray-500">
          Buscando por: <span className="font-semibold">"{debouncedSearchTerm}"</span>
        </p>
      )}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Erro ao carregar pets"
          message={error}
          onRetry={() => fetchPets(
            debouncedSearchTerm ? { name: debouncedSearchTerm } : undefined,
            currentPage,
            PAGE_SIZE
          )}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton type="card" count={PAGE_SIZE} />}

      {/* Empty State */}
      {!isLoading && !error && pets.length === 0 && (
        <EmptyState
          icon={
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
              />
            </svg>
          }
          title={
            debouncedSearchTerm
              ? `Nenhum pet encontrado com "${debouncedSearchTerm}"`
              : 'Nenhum pet cadastrado'
          }
          description={
            debouncedSearchTerm
              ? 'Tente buscar com outros termos'
              : 'Comece cadastrando o primeiro pet'
          }
          action={
            debouncedSearchTerm ? (
              <Button variant="primary" onClick={clearSearch}>
                Limpar Busca
              </Button>
            ) : null
          }
        />
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
                onDelete={(id) => {
                  petFacade.deletePet(id);
                }}
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
