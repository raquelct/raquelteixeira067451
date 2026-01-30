import apiClient from '../api/axiosInstance';
import type {
  Tutor,
  CreateTutorDto,
  TutorFilters,
  TutorListResponse,
} from '../types/tutor.types';

/**
 * TutorService - Service Layer para API de Tutores
 * 
 * Responsabilidades (Single Responsibility):
 * - Única camada autorizada a usar axiosInstance
 * - Chamadas puras à API (GET, POST, PUT, DELETE)
 * - Retorna dados tipados conforme OpenAPI
 * - NENHUMA lógica de negócio (isso fica na Facade)
 * - NENHUM gerenciamento de estado (isso fica no Store)
 * 
 * UI Components NÃO devem importar este service diretamente.
 * Sempre usar TutorFacade como intermediário.
 */
export class TutorService {
  private readonly baseUrl = '/tutores';

  /**
   * Lista todos os tutores com filtros opcionais
   * GET /tutores
   */
  async getAll(filters?: TutorFilters, page = 1, limit = 20): Promise<TutorListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.cpf) params.append('cpf', filters.cpf);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.active !== undefined)
      params.append('active', String(filters.active));
    
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await apiClient.get<TutorListResponse>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Busca um tutor específico por ID
   * GET /tutores/:id
   */
  async getById(id: string): Promise<Tutor> {
    const response = await apiClient.get<Tutor>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Busca um tutor por CPF
   * GET /tutores/cpf/:cpf
   */
  async getByCpf(cpf: string): Promise<Tutor> {
    const response = await apiClient.get<Tutor>(`${this.baseUrl}/cpf/${cpf}`);
    return response.data;
  }

  /**
   * Cria um novo tutor
   * POST /tutores
   */
  async create(data: CreateTutorDto): Promise<Tutor> {
    const response = await apiClient.post<Tutor>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Atualiza um tutor existente
   * PUT /tutores/:id
   */
  async update(id: string, data: Partial<CreateTutorDto>): Promise<Tutor> {
    const response = await apiClient.put<Tutor>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Remove um tutor
   * DELETE /tutores/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Ativa/Desativa um tutor
   * PATCH /tutores/:id/status
   */
  async toggleActive(id: string, active: boolean): Promise<Tutor> {
    const response = await apiClient.patch<Tutor>(`${this.baseUrl}/${id}/status`, {
      active,
    });
    return response.data;
  }

  /**
   * Busca estatísticas de tutores
   * GET /tutores/stats
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCity: Record<string, number>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }
}

// Exporta instância singleton
export const tutorService = new TutorService();
