import { PawPrint } from 'lucide-react';
import type { Pet } from '../../types/pet.types';

interface PetProfileCardProps {
  pet: Pet;
  onEdit: () => void;
}

export const PetProfileCard = ({ pet, onEdit }: PetProfileCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Pet Image */}
      <div className="aspect-square bg-gray-100 group relative">
        {pet.photoUrl ? (
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
            <PawPrint className="w-32 h-32 opacity-50" />
          </div>
        )}
      </div>

      {/* Pet Info */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pet.name}</h1>
        
        {/* Bio / Breed */}
        {pet.breed && (
          <p className="text-gray-500 italic mb-6 px-4">
            "{pet.breed}"
          </p>
        )}

        {/* Age Highlight */}
        <div className="inline-flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-semibold">
          <span className="text-xl">🎂</span>
          <span>
            {pet.age !== undefined ? `${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : 'Idade não informada'}
          </span>
        </div>

        {/* Action button */}
        <button 
          onClick={onEdit}
          className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl"
        >
          Editar Informações
        </button>
      </div>
    </div>
  );
};
