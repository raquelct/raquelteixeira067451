import apiClient from '../api/axiosInstance';
import type { 
  Tutor, 
  TutorApiDto, 
  CreateTutorDto, 
  TutorFilters, 
  TutorListResponse,
  TutorListApiResponse 
} from '../types/tutor.types';

/**
 * TutorService - Camada de comunicação com a API de Tutores
 * 
 * Responsabilidades:
 * - Encapsula todas as chamadas HTTP para /v1/tutores
 * - Retorna DTOs tipados
 * - Transforma dados da API (português) para domínio (inglês)
 * - Mantém a responsabilidade única (Single Responsibility)
 */
class TutorService {
  private baseUrl = '/v1/tutores';

  /**
   * Transforma TutorApiDto (campos em português) para Tutor (campos em inglês)
   */
  private transformTutorDto(dto: TutorApiDto): Tutor {
    const tutor: Tutor = {
      id: dto.id,
      name: dto.nome,
      email: dto.email,
      phone: dto.telefone,
      address: dto.endereco,
      cpf: dto.cpf,
      foto: dto.foto,
      photo: dto.foto?.url,
    };

    return tutor;
  }

  /**
   * Busca todos os tutores com paginação
   * GET /v1/tutores
   */
  async getAll(filters?: TutorFilters, page = 0, size = 20): Promise<TutorListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.nome) params.append('nome', filters.nome);
    if (filters?.cpf) params.append('cpf', filters.cpf);
    
    params.append('page', String(page));
    params.append('size', String(size));

    const response = await apiClient.get<TutorListApiResponse>(
      `${this.baseUrl}?${params.toString()}`
    );

    // Transforma TutorApiDto[] para Tutor[]
    return {
      ...response.data,
      content: response.data.content.map((dto) => this.transformTutorDto(dto)),
    };
  }

  /**
   * Busca tutor por ID
   * GET /v1/tutores/:id
   */
  async getById(id: string): Promise<Tutor> {
    const response = await apiClient.get<TutorApiDto>(`${this.baseUrl}/${id}`);
    return this.transformTutorDto(response.data);
  }

  /**
   * Cria um novo tutor
   * POST /v1/tutores
   */
  async create(data: CreateTutorDto): Promise<Tutor> {
    const response = await apiClient.post<TutorApiDto>(this.baseUrl, data);
    return this.transformTutorDto(response.data);
  }

  /**
   * Upload de foto para um tutor existente
   * POST /v1/tutores/:tutorId/fotos
   */
  async uploadPhoto(tutorId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('foto', file);

    await apiClient.post(`${this.baseUrl}/${tutorId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Remove um tutor
   * DELETE /v1/tutores/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

// Exporta instância singleton
export const tutorService = new TutorService();
