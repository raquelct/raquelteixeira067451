import type { Pet, PetApiDto } from './pet.types';

export interface TutorPhoto {
  id?: number;
  url: string;
  nome?: string;
  tamanho?: number;
  tipo?: string;
}

export interface TutorApiDto {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
  foto?: TutorPhoto | null;
  pets?: PetApiDto[];
}

export interface Tutor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  cpf: string;
  foto?: TutorPhoto | null;
  photo?: string;
  pets?: Pet[];
}

export interface CreateTutorDto {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
}

export interface TutorFormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
}

export interface TutorFilters {
  nome?: string;
}

export interface TutorListApiResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: TutorApiDto[];
}

export interface TutorListResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: Tutor[];
}
