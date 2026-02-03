import apiClient from './api';
import type {
  Pet,
  PetApiDto,
  CreatePetDto,
  PetFilters,
  PetListResponse,
  PetListApiResponse,
  Tutor
} from '../types/pet.types';

export class PetService {
  private readonly baseUrl = '/v1/pets';

  private toDomain(dto: PetApiDto): Pet {
    const pet: Pet = {
      id: dto.id,
      name: dto.nome,
      breed: dto.raca,
      age: dto.idade,
      photoUrl: dto.foto?.url,
      photoId: dto.foto?.id,
      ownerName: dto.tutorNome,
      ownerCpf: dto.tutorCpf,
    };

    if (dto.tutores && Array.isArray(dto.tutores)) {
      pet.tutors = dto.tutores.map((t): Tutor => ({
        id: t.id,
        name: t.nome,
        cpf: t.cpf,
        email: t.email,
        phone: t.telefone,
        address: t.endereco,
        photoUrl: t.foto?.url
      }));
    }

    return pet;
  }

  async getAll(filters?: PetFilters, page = 0, size = 10): Promise<PetListResponse> {
    const params = new URLSearchParams();

    if (filters?.name) params.append('nome', filters.name);
    if (filters?.raca) params.append('raca', filters.raca);

    params.append('page', String(page));
    params.append('size', String(size));

    const response = await apiClient.get<PetListApiResponse>(
      `${this.baseUrl}?${params.toString()}`
    );

    return {
      ...response.data,
      content: response.data.content.map((dto) => this.toDomain(dto)),
    };
  }

  async getById(id: number): Promise<Pet> {
    const response = await apiClient.get<PetApiDto>(`${this.baseUrl}/${id}`);
    return this.toDomain(response.data);
  }


  async create(data: CreatePetDto): Promise<Pet> {
    const response = await apiClient.post<PetApiDto>(this.baseUrl, data);
    return this.toDomain(response.data);
  }

  async update(id: number, data: Partial<CreatePetDto>): Promise<Pet> {
    const response = await apiClient.put<PetApiDto>(`${this.baseUrl}/${id}`, data);
    return this.toDomain(response.data);
  }

  async uploadPhoto(petId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('foto', file);

    await apiClient.post(`${this.baseUrl}/${petId}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  }

  async deletePhoto(petId: number, fotoId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${petId}/fotos/${fotoId}`);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const petService = new PetService();
