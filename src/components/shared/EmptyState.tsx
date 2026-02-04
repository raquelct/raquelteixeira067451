import type { ReactNode } from 'react';
import { stateStyles } from '../../styles/theme';
import emptyBoxIcon from '../../assets/icons/empty-box.svg';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}


export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className={stateStyles.empty}>
      {icon || <img src={emptyBoxIcon} alt="" className="mx-auto h-24 w-24 mb-4 opacity-60" />}
      
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};
