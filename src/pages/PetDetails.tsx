import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePets } from '../hooks/usePets';
import type { PetDetail } from '../types/pet.types';

/**
 * PetDetails - Página de Detalhes do Pet
 * 
 * Features de Nível Sênior:
 * - Usa Facade Pattern (UI → usePets → PetFacade → PetService)
 * - Subscribe ao currentPet$ (RxJS BehaviorSubject)
 * - Loading, Error, e Empty states profissionais
 * - Layout responsivo two-column
 * - Alto contraste (corrige problema de texto branco)
 * - Type-safe com PetDetail
 * 
 * Rota: /pets/:id
 */
export const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPet, isLoading, error, fetchPetById } = usePets();
  
  const [notFound, setNotFound] = useState(false);

  // Fetch pet ao montar o componente
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    console.log('[PetDetails] Fetching pet:', id);
    
    fetchPetById(id).catch((err) => {
      console.error('[PetDetails] Error fetching pet:', err);
      // 404 ou erro de rede
      if (err.response?.status === 404) {
        setNotFound(true);
      }
    });
  }, [id, fetchPetById]);

  const handleGoBack = () => {
    navigate('/');
  };

  // ========== Loading State ==========
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-10 w-32 bg-gray-200 rounded-lg mb-4"></div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column Skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== Not Found State ==========
  if (notFound || (!isLoading && !currentPet)) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white rounded-xl shadow-lg p-12">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Pet não encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            O pet que você está procurando não existe ou foi removido.
          </p>
          <button
            onClick={handleGoBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Voltar para a lista
          </button>
        </div>
      </div>
    );
  }

  // ========== Error State ==========
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white rounded-xl shadow-lg p-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Erro ao carregar pet
          </h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-8">
            Tente novamente mais tarde ou volte para a lista.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => id && fetchPetById(id)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Voltar para a lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Type guard - garantir que currentPet existe
  if (!currentPet) {
    return null;
  }

  const pet = currentPet as PetDetail;

  // ========== Main Content ==========
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Voltar</span>
      </button>

      {/* Pet Details Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Column - Pet Image & Primary Info */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 lg:p-8">
            {/* Pet Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-md mb-6">
              {pet.foto?.url || pet.photo ? (
                <img
                  src={pet.foto?.url || pet.photo || ''}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              {!pet.foto?.url && !pet.photo && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl">🐾</span>
                </div>
              )}

            </div>

            {/* Pet Name */}
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {pet.name}
            </h1>

            {/* Breed */}
            {pet.breed && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Raça</p>
                <p className="text-xl font-semibold text-gray-700">{pet.breed}</p>
              </div>
            )}

            {/* Additional Info Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Age */}
              {pet.age !== undefined && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Idade</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.age} {pet.age === 1 ? 'ano' : 'anos'}
                  </p>
                </div>
              )}

              {/* Weight */}
              {pet.weight && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Peso</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.weight} kg
                  </p>
                </div>
              )}

              {/* Color */}
              {pet.color && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Cor</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.color}
                  </p>
                </div>
              )}

              {/* Microchip */}
              {pet.microchipId && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Microchip</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {pet.microchipId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tutor Info & Additional Details */}
          <div className="p-6 lg:p-8 space-y-6">
            {/* Tutor Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Informações do Tutor
              </h2>

              {pet.tutores && pet.tutores.length > 0 ? (
                <div className="space-y-4 bg-gray-50 rounded-lg p-5">
                  {/* Tutor Name */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nome</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.tutores[0].nome}
                    </p>
                  </div>

                  {/* Document (CPF) */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">CPF</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">
                      {pet.tutores[0].cpf}
                    </p>
                  </div>

                  {/* Phone */}
                  {pet.tutores[0].telefone && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telefone</p>
                      <a
                        href={`tel:${pet.tutores[0].telefone}`}
                        className="text-lg text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                      >
                        {pet.tutores[0].telefone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-5 text-center">
                  <p className="text-gray-500">Nenhum tutor vinculado</p>
                </div>
              )}
            </div>

            {/* Observations */}
            {pet.observations && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Observações
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <p className="text-gray-700 leading-relaxed">
                    {pet.observations}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex gap-3">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors">
                Editar Informações
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
