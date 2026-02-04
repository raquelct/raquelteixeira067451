import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Users, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePetDetails } from '../hooks/usePetDetails';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { petFacade } from '../facades/pet.facade';
import { ProfileHero } from '../components/ui/ProfileHero';
import { GridList } from '../components/ui/GridList';
import type { Tutor } from '../types/tutor.types';

export const PetDetails = () => {
  const navigate = useNavigate();
  const { pet, isLoading, error, notFound } = usePetDetails();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleGoBack = () => navigate('/');
  const handleEdit = () => pet && navigate(`/pets/${pet.id}/edit`);
  const handleTutorClick = (tutorId: number) => navigate(`/tutores/${tutorId}`);
  
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

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-32 bg-gray-200 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-[500px] bg-gray-200 rounded-xl"></div>
          <div className="lg:col-span-2 h-[300px] bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (notFound || !pet || error) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{error || 'Pet não encontrado'}</h2>
        <button onClick={handleGoBack} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Voltar</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <button onClick={handleGoBack} className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 mb-6 font-medium transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Voltar</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-6">
          <ProfileHero
            imageUrl={pet.photoUrl}
            title={pet.name}
            subtitle={pet.breed ? `"${pet.breed}"` : undefined}
            variant="pet"
            badges={
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-semibold">
                <span className="text-xl">🎂</span>
                <span>{pet.age !== undefined ? `${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : 'Idade não informada'}</span>
              </div>
            }
            actions={
              <>
                <button onClick={handleEdit} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-all active:scale-95 shadow-lg">Editar Informações</button>
                <button onClick={() => setDeleteModalOpen(true)} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl transition-colors active:scale-95 border border-red-100">Excluir Pet</button>
              </>
            }
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <GridList<Tutor>
            title="Tutores Responsáveis"
            icon={Users}
            items={pet.tutors}
            emptyStateMessage="Nenhum tutor vinculado a este pet."
            renderItem={(tutor) => (
              <div 
                onClick={() => handleTutorClick(tutor.id)}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                  {tutor.photo ? (
                    <img src={tutor.photo} alt={tutor.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="font-bold text-gray-400 text-lg">{tutor.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{tutor.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{tutor.phone}</span>
                  </div>
                </div>
              </div>
            )}
          />

          {pet.observations && (
             <section className="bg-white rounded-xl p-6 shadow-sm border border-orange-100/50">
              <div className="flex items-start gap-3">
                 <div className="mt-1"><AlertTriangle className="w-5 h-5 text-orange-400" /></div>
                 <div>
                    <h3 className="font-bold text-gray-800 mb-2">Observações e Cuidados</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{pet.observations}</p>
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
        message={<span>Tem certeza que deseja excluir <b>{pet.name}</b>?<br /><span className="text-sm text-red-600 mt-2 block">Esta ação não pode ser desfeita.</span></span>}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
};
