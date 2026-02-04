import { containerStyles } from '../../styles/theme';
import { CardSkeleton } from './CardSkeleton';

type SkeletonType = 'card' | 'list' | 'table' | 'form';

interface LoadingSkeletonProps {
  type?: SkeletonType;
  count?: number;
}

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

const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
       <div className="h-8 bg-gray-300 rounded w-1/3 mb-6" />
       <div className="space-y-4">
         <div className="h-12 bg-gray-200 rounded" />
         <div className="h-12 bg-gray-200 rounded" />
         <div className="h-12 bg-gray-200 rounded" />
         <div className="h-32 bg-gray-200 rounded" />
       </div>
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
    form: FormSkeleton,
  }[type];

  return (
    <div className={type === 'card' ? containerStyles.grid : 'space-y-4'}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};
