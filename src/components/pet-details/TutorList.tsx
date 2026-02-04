import { Users, Phone, Mail, UserX } from 'lucide-react';
import { maskPhone } from '../../utils/masks';
import type { Tutor } from '../../types/tutor.types';

interface TutorListProps {
  tutors?: Tutor[];
}

export const TutorList = ({ tutors }: TutorListProps) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Tutores Responsáveis</h2>
      </div>

      {tutors && tutors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
              {/* Avatar */}
              <div className="shrink-0">
                {tutor.photo ? (
                  <img 
                    src={tutor.photo} 
                    alt={tutor.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-indigo-100 transition-colors"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-lg border-2 border-indigo-100">
                    {tutor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-bold text-gray-900 truncate text-lg" title={tutor.name}>
                  {tutor.name}
                </h3>
                
                {tutor.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    {maskPhone(tutor.phone)}
                  </div>
                )}
                
                {tutor.email && (
                  <div className="flex items-center text-sm text-slate-500">
                     <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                     <span className="truncate" title={tutor.email}>{tutor.email}</span>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserX className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Nenhum tutor vinculado</h3>
          <p className="text-gray-500 text-sm">Edite o pet para adicionar tutores responsáveis.</p>
        </div>
      )}
    </section>
  );
};
