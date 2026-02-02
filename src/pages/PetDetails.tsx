import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePetDetails } from '../hooks/usePetDetails';
import { PetProfileCard } from '../components/pet-details/PetProfileCard';
import { TutorList } from '../components/pet-details/TutorList';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { petFacade } from '../facades/pet.facade';


export const PetDetails = () => {
  const navigate = useNavigate();
  const { pet, isLoading, error, notFound, reload } = usePetDetails();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleGoBack = () => navigate('/');
  const handleEdit = () => pet && navigate(`/pets/${pet.id}/edit`);
  
  const handleDelete = async () => {
    if (!pet) return;
    
    try {
      await petFacade.deletePet(pet.id);
      toast.success('Pet removido com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao remover pet:', error);
      toast.error('Erro ao remover pet. Tente novamente.');
    }
  };

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
          <PetProfileCard 
            pet={pet} 
            onEdit={handleEdit} 
            onDelete={() => setDeleteModalOpen(true)}
          />
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

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Pet"
        message={
          <span>
            Tem certeza que deseja excluir <b>{pet.name}</b>?
            <br />
            <span className="text-sm text-red-600 mt-2 block">
              Esta ação não pode ser desfeita.
            </span>
          </span>
        }
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
};
