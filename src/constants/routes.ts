export const ROUTES = {
  LOGIN: '/login',
  
  HOME: '/',
  
  PETS: '/',
  PET_NEW: '/pet/new',
  PET_EDIT: (id: number | string) => `/pet/${id}`,
  PET_DETAILS: (id: number | string) => `/pet/${id}/details`,
  
  TUTORS: '/tutores',
  TUTOR_NEW: '/tutor/new',
  TUTOR_EDIT: (id: number | string) => `/tutor/${id}`,
  TUTOR_DETAILS: (id: number | string) => `/tutor/${id}/details`,
  
  STATUS: '/status',
} as const;

export type Routes = typeof ROUTES;
