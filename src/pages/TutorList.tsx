import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutores } from '../hooks/useTutores';
import { GenericCard } from '../components/shared/GenericCard';
import { SearchBar } from '../components/shared/SearchBar';
import { Pagination } from '../components/shared/Pagination';
import { PageHeader } from '../components/shared/PageHeader';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorState } from '../components/shared/ErrorState';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { Button } from '../components/shared/Button';
import { containerStyles } from '../styles/theme';
import { tutorFacade } from '../facades/tutor.facade';
import { maskCPF, maskPhone } from '../utils/masks';


export const TutorList = () => {
  const navigate = useNavigate();
  const {
    tutores,
    isLoading,
    error,
    totalCount,
    fetchTutores,
  } = useTutores();

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const filters = debouncedSearchTerm ? { nome: debouncedSearchTerm } : undefined;
    fetchTutores(filters, currentPage, PAGE_SIZE);
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

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={clearSearch}
        placeholder="Buscar tutor por nome..."
        className="mb-6"
      />
      {debouncedSearchTerm && (
        <p className="mb-6 text-sm text-gray-500">
          Buscando por: <span className="font-semibold">"{debouncedSearchTerm}"</span>
        </p>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState
          title="Erro ao carregar tutores"
          message={error}
          onRetry={() => fetchTutores(
            debouncedSearchTerm ? { nome: debouncedSearchTerm } : undefined,
            currentPage,
            PAGE_SIZE
          )}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton type="card" count={PAGE_SIZE} />}

      {/* Empty State */}
      {!isLoading && tutores.length === 0 && !error && (
        <EmptyState
          icon={
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          title={
            debouncedSearchTerm
              ? `Nenhum tutor encontrado com "${debouncedSearchTerm}"`
              : 'Nenhum tutor cadastrado'
          }
          description={
            debouncedSearchTerm
              ? 'Tente buscar com outros termos'
              : 'Comece cadastrando um novo tutor'
          }
          action={
            debouncedSearchTerm ? (
              <Button variant="primary" onClick={clearSearch}>
                Limpar Busca
              </Button>
            ) : (
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
            )
          }
        />
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
                description={maskPhone(tutor.phone)}
                imageUrl={tutor.foto?.url || tutor.photo}
                icon="👤"
                onViewDetails={(id) => navigate(`/tutores/${id}/edit`)}
                onEdit={(id) => navigate(`/tutores/${id}/edit`)}
                onDelete={(id) => {
                  tutorFacade.deleteTutor(id);
                }}
                additionalInfo={
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <p>CPF: {maskCPF(tutor.cpf)}</p>
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
