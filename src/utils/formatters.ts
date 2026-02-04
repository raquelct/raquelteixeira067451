export const getSubtitle = (count: number, singular: string, plural: string): string => {
  if (count === 0) return `Nenhum ${singular} cadastrado`;
  return `${count} ${count === 1 ? `${singular} encontrado` : `${plural} encontrados`}`;
};
