import apiClient from '../api/axiosInstance';
import type {
  Pet,
  PetApiDto,
  CreatePetDto,
  PetFilters,
  PetListResponse,
  PetListApiResponse,
} from '../types/pet.types';

/**
 * PetService - Service Layer para API de Pets
 * 
 * Responsabilidades (Single Responsibility):
 * - Única camada autorizada a usar axiosInstance
 * - Chamadas puras à API (GET, POST, PUT, DELETE)
 * - Transforma PetApiDto (português) para Pet (inglês)
 * - Retorna dados tipados conforme OpenAPI
 * - NENHUMA lógica de negócio (isso fica na Facade)
 * - NENHUM gerenciamento de estado (isso fica no Store)
 * 
 * UI Components NÃO devem importar este service diretamente.
 * Sempre usar PetFacade como intermediário.
 */
export class PetService {
  private readonly baseUrl = '/v1/pets';

  /**
   * Transforma PetApiDto (campos em português) para Pet (campos em inglês)
   * Mapeia APENAS campos que a API realmente retorna
   */
  private transformPetDto(dto: PetApiDto): Pet {
    const pet: Pet = {
      id: dto.id,
      name: dto.nome,
      breed: dto.raca,
      age: dto.idade,
      foto: dto.foto,
      photo: dto.foto?.url, // Mantido para compatibilidade
      weight: dto.peso,
      color: dto.cor,
      microchipId: dto.microchipId,
      observations: dto.observacoes,
    };

    // Campos opcionais do tutor (quando vem da lista)
    if (dto.tutorCpf) pet.ownerCpf = dto.tutorCpf;
    if (dto.tutorNome) pet.ownerName = dto.tutorNome;
    if (dto.tutorTelefone) pet.ownerPhone = dto.tutorTelefone;
    if (dto.tutorEmail) pet.ownerEmail = dto.tutorEmail;

    // Array de tutores (quando vem do GET /pets/:id)
    if (dto.tutores && Array.isArray(dto.tutores)) {
      (pet as any).tutores = dto.tutores.map(tutor => ({
        id: tutor.id,
        nome: tutor.nome,
        cpf: tutor.cpf,
        telefone: tutor.telefone,
        foto: tutor.foto,
      }));
    }

    return pet;
  }

  /**
   * Lista todos os pets com filtros opcionais
   * GET /v1/pets
   * 
   * Parâmetros conforme OpenAPI:
   * - page: número da página (0-indexed)
   * - size: quantidade de itens por página
   * - nome: filtro por nome (opcional)
   */
  async getAll(filters?: PetFilters, page = 0, size = 20): Promise<PetListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.name) params.append('nome', filters.name);
    if (filters?.ownerCpf) params.append('ownerCpf', filters.ownerCpf);
    
    params.append('page', String(page));
    params.append('size', String(size));

    const response = await apiClient.get<PetListApiResponse>(
      `${this.baseUrl}?${params.toString()}`
    );

    // Transforma PetApiDto[] para Pet[]
    return {
      ...response.data,
      content: response.data.content.map((dto) => this.transformPetDto(dto)),
    };
  }

  /**
   * Busca um pet específico por ID
   * GET /v1/pets/:id
   */
  async getById(id: string): Promise<Pet> {
    const response = await apiClient.get<PetApiDto>(`${this.baseUrl}/${id}`);
    return this.transformPetDto(response.data);
  }

  /**
   * Busca pets de um tutor específico
   * GET /v1/pets/tutor/:cpf
   */
  async getByTutorCpf(cpf: string): Promise<Pet[]> {
    const response = await apiClient.get<PetApiDto[]>(`${this.baseUrl}/tutor/${cpf}`);
    return response.data.map((dto) => this.transformPetDto(dto));
  }

  /**
   * Cria um novo pet
   * POST /v1/pets
   */
  async create(data: CreatePetDto): Promise<Pet> {
    const response = await apiClient.post<PetApiDto>(this.baseUrl, data);
    return this.transformPetDto(response.data);
  }

  /**
   * Atualiza um pet existente
   * PUT /v1/pets/:id
   */
  async update(id: string, data: Partial<CreatePetDto>): Promise<Pet> {
    const response = await apiClient.put<PetApiDto>(`${this.baseUrl}/${id}`, data);
    return this.transformPetDto(response.data);
  }

  /**
   * Upload de foto para um pet existente
   * POST /v1/pets/:petId/fotos
   * @param petId - ID do pet
   * @param file - Arquivo de imagem
   */
  async uploadPhoto(petId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('foto', file);  // Key "foto" conforme Swagger

    await apiClient.post(`${this.baseUrl}/${petId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Remove um pet
   * DELETE /v1/pets/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca estatísticas de pets
   * GET /v1/pets/stats
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
