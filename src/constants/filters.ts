export const ENTITY_FILTERS = {
  PET: [
    { label: 'Nome', value: 'name' },
    { label: 'Raça', value: 'raca' },
  ],
  TUTOR: [
    { label: 'Nome', value: 'nome' },
  ],
} as const;

export type FilterOption = {
  label: string;
  value: string;
};

export type EntityFiltersConfig = typeof ENTITY_FILTERS;
