export const getSubtitle = (count: number, singular: string, plural: string): string => {
  if (count === 0) return `Nenhum ${singular} cadastrado`;
  return `${count} ${count === 1 ? `${singular} encontrado` : `${plural} encontrados`}`;
};

export const formatAge = (age: number | undefined): string => {
  if (age === undefined) return 'Idade não informada';
  return `${age} ${age === 1 ? 'ano' : 'anos'}`;
};
