import { Skeleton } from '../ui/Skeleton';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      {/* Imagem: Retângulo no topo (aspect-square ou 4/3) - matching GenericCard */}
      <Skeleton className="w-full aspect-[4/3] rounded-none" />

      {/* Conteúdo: Padding container (p-4) */}
      <div className="p-4 flex flex-col items-center flex-1 space-y-3">
        {/* Título: Barra h-6 w-3/4 mb-2 */}
        <Skeleton className="h-6 w-3/4 mb-2" />

        {/* Subtítulo: Duas barras */}
        <div className="w-full flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-[0.5rem]" />

        {/* Footer actions - matching the new discreet footer */}
        <div className="w-full flex justify-end gap-2 mt-auto pt-2 border-t border-gray-100">
           <Skeleton className="h-8 w-8 rounded-full" />
           <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};
