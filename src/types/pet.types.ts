export interface PetPhotoDto {
  id?: number;
  url: string;
  nome?: string;
  tamanho?: number;
  tipo?: string;
}

export interface PetApiDto {
  id: number;
  nome: string;
  raca?: string;     
  idade?: number;
  foto?: PetPhotoDto | null;
  tutorCpf?: string;
  tutorNome?: string;
  tutorTelefone?: string;
  tutorEmail?: string;
  tutores?: Array<{
    id: number;
    nome: string;
    cpf: string;
    email?: string;
    endereco?: string;
    telefone?: string;
    foto?: PetPhotoDto | null;
  }>;
}

export interface PetListApiResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: PetApiDto[];
}

export interface PetPhoto {
  id?: number;
  url: string;
}

export interface Tutor {
  id: number;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
}

export interface Pet {
  id: number;
  name: string;
  breed?: string;
  age?: number;
  photoUrl?: string;
  photoId?: number;
  weight?: number;
  color?: string;
  microchipId?: string;
  observations?: string;
  ownerName?: string;
  ownerCpf?: string;
  tutors?: Tutor[];
}

export interface CreatePetDto {
  nome: string;
  raca: string;
  idade: number;
}

export type PetFormData = CreatePetDto;

export interface UpdatePetDto extends Partial<CreatePetDto> {
  id: number;
}

export interface PetFilters {
  name?: string;
  ownerCpf?: string;
}

export interface PetListResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: Pet[];
}
