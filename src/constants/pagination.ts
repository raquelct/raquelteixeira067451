export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  INITIAL_PAGE: 0,
} as const;

export type PaginationConfig = typeof PAGINATION;
