/**
 * Tipos relacionados a Pets
 * Para futuras implementações do CRUD
 */

/**
 * Estrutura da foto do pet conforme API
 */
export interface PetPhoto {
  url: string;
  nome?: string;
  tamanho?: number;
  tipo?: string;
}

/**
 * DTO da API - Campos em português conforme retornado pelo backend
 */
export interface PetApiDto {
  id: string;
  nome: string;
  especie: 'dog' | 'cat' | 'bird' | 'other';
  raca?: string;
  idade?: number;
  peso?: number;
  cor?: string;
  tutorCpf: string;
  tutorNome: string;
  tutorTelefone: string;
  tutorEmail: string;
  dataCadastro: string;
  vacinado: boolean;
  castrado: boolean;
  microchipId?: string;
  foto?: PetPhoto | null;
  observacoes?: string;
}

/**
 * Modelo de domínio - Campos em inglês para uso na aplicação
 * Interface Pet conforme estrutura real da API (mapeada do PetApiDto)
 */
export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  ownerCpf: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  registrationDate: string;
  vaccinated: boolean;
  neutered: boolean;
  microchipId?: string;
  foto?: PetPhoto | null;  // API retorna 'foto', não 'photo'
  photo?: string;           // Mantido para compatibilidade (deprecated)
  observations?: string;
}

export interface CreatePetDto {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  ownerCpf: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  vaccinated: boolean;
  neutered: boolean;
  microchipId?: string;
  photo?: string;
  observations?: string;
}

export interface UpdatePetDto extends Partial<CreatePetDto> {
  id: string;
}

export interface PetFilters {
  name?: string;
  species?: Pet['species'];
  ownerCpf?: string;
  vaccinated?: boolean;
  neutered?: boolean;
}

/**
 * Resposta paginada da API de Pets (DTO em português)
 */
export interface PetListApiResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: PetApiDto[];
}

/**
 * Resposta paginada da API de Pets (modelo de domínio)
 * Conforme estrutura real da API (mapeada)
 */
export interface PetListResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: Pet[];
}
