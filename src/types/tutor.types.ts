/**
 * Tipos relacionados a Tutores
 * Alinhados com a API real
 */

/**
 * Foto do tutor (estrutura similar à de Pet)
 */
export interface TutorPhoto {
  url: string;
  nome?: string;
  tamanho?: number;
  tipo?: string;
}

/**
 * DTO da API - Campos em português conforme retornado pelo backend
 */
export interface TutorApiDto {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
  foto?: TutorPhoto | null;
}

/**
 * Modelo de domínio - Campos em inglês para uso na aplicação
 */
export interface Tutor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cpf: string;
  foto?: TutorPhoto | null;
  photo?: string; // Compatibilidade (deprecated)
}

/**
 * DTO para criação de tutor - Campos em português conforme API
 */
export interface CreateTutorDto {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
}

/**
 * Dados do formulário de criação de tutor (UI)
 */
export interface TutorFormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
}

/**
 * Filtros para busca de tutores
 */
export interface TutorFilters {
  nome?: string;
  cpf?: string;
}

/**
 * Resposta da API para lista de tutores
 */
export interface TutorListApiResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: TutorApiDto[];
}

/**
 * Resposta transformada para lista de tutores
 */
export interface TutorListResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: Tutor[];
}
