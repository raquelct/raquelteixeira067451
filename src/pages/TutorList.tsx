import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutores } from '../hooks/useTutores';
import { GenericCard } from '../components/shared/GenericCard';
import { Pagination } from '../components/shared/Pagination';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { containerStyles, stateStyles } from '../styles/theme';

/**
 * TutorList - Listagem de Tutores com Paginação
 * 
 * Features:
 * - Grid responsivo usando GenericCard
 * - Paginação (10 items/página)
 * - Loading skeleton
 * - Empty & Error states
 * - Subscribe aos Observables via useTutores hook
 * - Facade Pattern: UI → Hook → Facade → Service
 */
export const TutorList = () => {
  const navigate = useNavigate();
  const {
    tutores,
    isLoading,
    error,
    totalCount,
    fetchTutores,
  } = useTutores();

  // API usa paginação 0-indexed (page 0 = primeira página)
  const [currentPage, setCurrentPage] = useState(0);
  
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Fetch tutores quando página mudar
  useEffect(() => {
    if (isLoading) {
      console.log('[TutorList] Skipping fetch - already loading');
      return;
    }
    
    console.log('[TutorList] Fetching page:', currentPage);
    fetchTutores(undefined, currentPage, PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <PageHeader
        title="Tutores Cadastrados"
        subtitle={
          totalCount > 0 
            ? `${totalCount} ${totalCount === 1 ? 'tutor encontrado' : 'tutores encontrados'}`
            : 'Nenhum tutor cadastrado'
        }
        icon="👥"
        buttonLabel="Novo Tutor"
        navigateTo="/tutores/new"
      />

      {/* Error State */}
      {error && !isLoading && (
        <div className={stateStyles.error}>
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Erro ao carregar tutores</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={() => fetchTutores(undefined, currentPage, PAGE_SIZE)}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className={containerStyles.grid}>
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
      {!isLoading && tutores.length === 0 && !error && (
        <div className={stateStyles.empty}>
          <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum tutor encontrado</h3>
          <p className="text-gray-500 mb-6">Comece cadastrando um novo tutor</p>
          <Button
            variant="primary"
            onClick={() => navigate('/tutores/new')}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Cadastrar Primeiro Tutor
          </Button>
        </div>
      )}

      {/* Tutors Grid */}
      {!isLoading && !error && tutores.length > 0 && (
        <>
          <div className={containerStyles.grid}>
            {tutores.map((tutor) => (
              <GenericCard
                key={tutor.id}
                id={tutor.id}
                title={tutor.name}
                subtitle={tutor.email}
                description={tutor.phone}
                imageUrl={tutor.foto?.url || tutor.photo}
                icon="👤"
                onViewDetails={(id) => navigate(`/tutores/${id}`)}
                onEdit={(id) => navigate(`/tutores/${id}/edit`)}
                additionalInfo={
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <p>CPF: {tutor.cpf}</p>
                  </div>
                }
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
