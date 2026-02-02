import type { ReactNode } from 'react';
import { PawPrint } from 'lucide-react';

interface ProfileHeroProps {
  imageUrl?: string | null;
  fallbackInitial?: string;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  variant?: 'pet' | 'tutor';
}

export const ProfileHero = ({
  imageUrl,
  fallbackInitial,
  title,
  subtitle,
  badges,
  actions,
  children,
  variant = 'pet'
}: ProfileHeroProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Hero Image / Avatar */}
      <div className="aspect-square bg-gray-100 group relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
            {variant === 'pet' ? (
              <PawPrint className="w-32 h-32 opacity-50" />
            ) : (
              <span className="text-6xl font-bold opacity-50">{fallbackInitial}</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        
        {/* Subtitle (e.g. Breed or "Tutor") */}
        {subtitle && (
          <p className="text-gray-500 italic mb-6 px-4">
            {subtitle}
          </p>
        )}

        {/* Badges (e.g. Age) */}
        {badges && (
          <div className="flex justify-center mb-6">
            {badges}
          </div>
        )}

        {/* Children (Bio, Contact Info, etc) */}
        {children && (
          <div className="mb-8 text-gray-600">
            {children}
          </div>
        )}

        {/* Actions (Edit/Delete Buttons) */}
        {actions && (
          <div className="space-y-3 mt-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
