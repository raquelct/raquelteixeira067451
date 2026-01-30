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
 * APENAS campos que a API realmente retorna
 */
export interface PetApiDto {
  id: string;
  nome: string;
  raca?: string;
  idade?: number;
  foto?: PetPhoto | null;
  // Campos opcionais adicionais (se existirem)
  peso?: number;
  cor?: string;
  microchipId?: string;
  observacoes?: string;
  // Campos da lista (quando não vem detalhado)
  tutorCpf?: string;
  tutorNome?: string;
  tutorTelefone?: string;
  tutorEmail?: string;
  // Array de tutores (quando vem detalhado - GET /pets/:id)
  tutores?: Array<{
    id: number;
    nome: string;
    cpf: string;
    telefone?: string;
    foto?: PetPhoto | null;
  }>;
}

/**
 * Informações do tutor (aninhado na resposta de detalhes do pet)
 */
export interface PetTutor {
  id: number;
  nome: string;
  cpf: string;  // CPF do tutor
  telefone?: string;
  foto?: PetPhoto | null;
}

/**
 * Modelo de domínio - Campos em inglês para uso na aplicação
 * Interface Pet conforme estrutura REAL da API (mapeada do PetApiDto)
 * 
 * Campos principais da API:
 * - id: number
 * - nome: string
 * - raca: string
 * - idade: number
 * - foto: { url: string } | null
 */
export interface Pet {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  foto?: PetPhoto | null;  // API retorna 'foto', não 'photo'
  photo?: string;           // Mantido para compatibilidade (deprecated)
  // Campos opcionais adicionais
  weight?: number;
  color?: string;
  microchipId?: string;
  observations?: string;
  // Campos básicos do tutor (quando vem da lista)
  ownerCpf?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}

/**
 * Pet Detail - Estende Pet com informações aninhadas de tutores
 * Usado na página de detalhes (/pets/:id)
 */
export interface PetDetail extends Pet {
  tutores?: PetTutor[];  // Array de tutores vinculados (quando disponível na API)
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
  ownerCpf?: string;
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
