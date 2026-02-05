import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PawPrint, Mail, Phone, MapPin, UserSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTutorDetails } from '../../hooks/tutor/useTutorDetails';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { useTutorFacade } from '../../facades/tutor.facade';
import { ProfileHero } from '../../components/ui/ProfileHero';
import { GridList } from '../../components/ui/GridList';
import type { Pet } from '../../types/pet.types';

export const TutorDetails = () => {
  const navigate = useNavigate();
  const { deleteTutor } = useTutorFacade();
  const { tutor, isLoading, error, notFound } = useTutorDetails();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleGoBack = () => navigate('/tutores');
  const handleEdit = () => tutor && navigate(`/tutores/${tutor.id}/edit`);
  const handlePetClick = (petId: number) => navigate(`/pets/${petId}`);
  
  const handleDelete = async () => {
    if (!tutor) return;
    try {
      await deleteTutor(tutor.id);
      toast.success('Tutor removido com sucesso!');
      navigate('/tutores');
    } catch (error) {
      console.error('Erro ao remover tutor:', error);
      toast.error('Erro ao remover tutor. Tente novamente.');
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

  if (notFound || !tutor || error) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{error || 'Tutor não encontrado'}</h2>
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
            imageUrl={tutor.photo || (tutor.foto ? tutor.foto.url : undefined)} // Handler legacy vs new API structure
            title={tutor.name}
            subtitle="Tutor Responsável"
            variant="tutor"
            fallbackInitial={tutor.name.charAt(0).toUpperCase()}
            actions={
              <>
                <button onClick={handleEdit} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-all active:scale-95 shadow-lg">Editar Informações</button>
                <button onClick={() => setDeleteModalOpen(true)} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl transition-colors active:scale-95 border border-red-100">Excluir Tutor</button>
              </>
            }
          >
             <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-indigo-500" />
                    <span className="text-gray-700 truncate">{tutor.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-indigo-500" />
                    <span className="text-gray-700">{tutor.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <UserSquare className="w-5 h-5 text-indigo-500" />
                    <span className="text-gray-700 font-mono text-sm">{tutor.cpf}</span>
                </div>
                {tutor.address && (
                   <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-indigo-500 mt-1" />
                      <span className="text-gray-700 text-sm leading-snug">{tutor.address}</span>
                   </div>
                )}
             </div>
          </ProfileHero>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <GridList<Pet>
            title="Pets Vinculados"
            icon={PawPrint}
            items={tutor.pets}
            emptyStateMessage="Nenhum pet vinculado a este tutor."
            renderItem={(pet) => (
              <div 
                 onClick={() => handlePetClick(pet.id)}
                 className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group"
               >
                 <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                   {pet.photoUrl ? (
                    <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <PawPrint className="w-8 h-8 text-indigo-200" />
                  )}
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{pet.name}</h3>
                   <div className="flex items-center text-sm text-gray-500 gap-1.5">
                     <PawPrint className="w-3.5 h-3.5" />
                     <span>{pet.breed || 'SRD'}</span>
                   </div>
                 </div>
              </div>
            )}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Tutor"
        message={<span>Tem certeza que deseja excluir <b>{tutor.name}</b>?<br /><span className="text-sm text-red-600 mt-2 block">Esta ação também removerá o vínculo com os pets.</span></span>}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
};
