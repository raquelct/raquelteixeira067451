import apiClient from '../api/axiosInstance';
import type {
  Pet,
  CreatePetDto,
  PetFilters,
  PetListResponse,
} from '../types/pet.types';

/**
 * PetService - Service Layer para API de Pets
 * 
 * Responsabilidades (Single Responsibility):
 * - Única camada autorizada a usar axiosInstance
 * - Chamadas puras à API (GET, POST, PUT, DELETE)
 * - Retorna dados tipados conforme OpenAPI
 * - NENHUMA lógica de negócio (isso fica na Facade)
 * - NENHUM gerenciamento de estado (isso fica no Store)
 * 
 * UI Components NÃO devem importar este service diretamente.
 * Sempre usar PetFacade como intermediário.
 */
export class PetService {
  private readonly baseUrl = '/pets';

  /**
   * Lista todos os pets com filtros opcionais
   * GET /pets
   */
  async getAll(filters?: PetFilters, page = 1, limit = 20): Promise<PetListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.species) params.append('species', filters.species);
    if (filters?.ownerCpf) params.append('ownerCpf', filters.ownerCpf);
    if (filters?.vaccinated !== undefined)
      params.append('vaccinated', String(filters.vaccinated));
    if (filters?.neutered !== undefined)
      params.append('neutered', String(filters.neutered));
    
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await apiClient.get<PetListResponse>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Busca um pet específico por ID
   * GET /pets/:id
   */
  async getById(id: string): Promise<Pet> {
    const response = await apiClient.get<Pet>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Busca pets de um tutor específico
   * GET /pets/tutor/:cpf
   */
  async getByTutorCpf(cpf: string): Promise<Pet[]> {
    const response = await apiClient.get<Pet[]>(`${this.baseUrl}/tutor/${cpf}`);
    return response.data;
  }

  /**
   * Cria um novo pet
   * POST /pets
   */
  async create(data: CreatePetDto): Promise<Pet> {
    const response = await apiClient.post<Pet>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Atualiza um pet existente
   * PUT /pets/:id
   */
  async update(id: string, data: Partial<CreatePetDto>): Promise<Pet> {
    const response = await apiClient.put<Pet>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Remove um pet
   * DELETE /pets/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca estatísticas de pets
   * GET /pets/stats
   */
  async getStats(): Promise<{
    total: number;
    bySpecies: Record<string, number>;
    vaccinated: number;
    neutered: number;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }
}

// Exporta instância singleton
export const petService = new PetService();
