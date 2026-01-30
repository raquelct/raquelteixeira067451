/**
 * Tipos relacionados a Tutores
 * Baseados no edital do Cadastro Público de Pets
 */

export interface Tutor {
  id: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  registrationDate: string;
  active: boolean;
}

export interface CreateTutorDto {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface UpdateTutorDto extends Partial<CreateTutorDto> {
  id: string;
}

export interface TutorFilters {
  cpf?: string;
  name?: string;
  email?: string;
  active?: boolean;
}

export interface TutorListResponse {
  tutores: Tutor[];
  total: number;
  page: number;
  limit: number;
}
