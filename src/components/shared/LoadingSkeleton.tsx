/**
 * LoadingSkeleton - Componente genérico para estados de loading
 * 
 * Features:
 * - Tipos diferentes (card, list, table)
 * - Quantidade customizável
 * - Animação pulse
 * - Grid responsivo
 */

import { containerStyles } from '../../styles/theme';

type SkeletonType = 'card' | 'list' | 'table';

interface LoadingSkeletonProps {
  type?: SkeletonType;
  count?: number;
}

/**
 * Skeleton de Card (para grid de pets/tutores)
 */
const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300" />
    <div className="p-6 space-y-3">
      <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
      <div className="h-10 bg-gray-300 rounded w-full mt-4" />
    </div>
  </div>
);

/**
 * Skeleton de Lista (para listagens simples)
 */
const ListSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="rounded-full bg-gray-300 h-12 w-12 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton de Tabela (para tabelas de dados)
 */
const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
);

export const LoadingSkeleton = ({
  type = 'card',
  count = 8,
}: LoadingSkeletonProps) => {
  const SkeletonComponent = {
    card: CardSkeleton,
    list: ListSkeleton,
    table: TableSkeleton,
  }[type];

  return (
    <div className={type === 'card' ? containerStyles.grid : 'space-y-4'}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};
