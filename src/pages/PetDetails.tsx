import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { usePetDetails } from '../hooks/usePetDetails';
import { PetProfileCard } from '../components/pet-details/PetProfileCard';
import { TutorList } from '../components/pet-details/TutorList';


export const PetDetails = () => {
  const navigate = useNavigate();
  const { pet, isLoading, error, notFound, reload } = usePetDetails();

  const handleGoBack = () => navigate('/');
  const handleEdit = () => pet && navigate(`/pets/${pet.id}/edit`);

  // ========== Loading State ==========
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 animate-pulse">
          <div className="h-10 w-32 bg-gray-200 rounded-lg mb-4"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
             <div className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
             <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // ========== Not Found State ==========
  if (notFound || !pet) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white rounded-xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Pet não encontrado</h2>
          <p className="text-gray-600 mb-8">O pet que você está procurando não existe ou foi removido.</p>
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
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Erro ao carregar pet</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={reload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== Main Content ==========
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 mb-6 font-medium transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Voltar</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column - Pet Card (Sticky) */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <PetProfileCard pet={pet} onEdit={handleEdit} />
        </div>

        {/* Right Column - Tutors & Details */}
        <div className="lg:col-span-2 space-y-6">
          <TutorList tutors={pet.tutors} />

          {/* Observations Section */}
          {pet.observations && (
             <section className="bg-white rounded-xl p-6 shadow-sm border border-orange-100/50">
              <div className="flex items-start gap-3">
                 <div className="mt-1">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-800 mb-2">Observações e Cuidados</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {pet.observations}
                    </p>
                 </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
