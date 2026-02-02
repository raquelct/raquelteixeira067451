import type { ElementType, ReactNode } from 'react';

interface GridListProps<T> {
  title: string;
  icon: ElementType;
  items?: T[];
  renderItem: (item: T) => ReactNode;
  emptyStateMessage: string;
}

export const GridList = <T,>({
  title,
  icon: Icon,
  items = [],
  renderItem,
  emptyStateMessage,
}: GridListProps<T>) => {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            {emptyStateMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div key={index}>
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
