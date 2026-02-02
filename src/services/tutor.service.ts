import apiClient from './api';
import type {
  Tutor,
  TutorApiDto,
  CreateTutorDto,
  TutorFilters,
  TutorListResponse,
  TutorListApiResponse
} from '../types/tutor.types';
import type { Pet, PetApiDto } from '../types/pet.types';

export class TutorService {
  private baseUrl = '/v1/tutores';

  private transformPetDto(dto: PetApiDto): Pet {
    return {
      id: dto.id,
      name: dto.nome,
      breed: dto.raca,
      age: dto.idade,
      photoId: dto.foto?.id,
    };
  }
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
      pets: dto.pets?.map((petDto) => this.transformPetDto(petDto)),
    };

    return tutor;
  }

  async getAll(filters?: TutorFilters, page = 0, size = 20): Promise<TutorListResponse> {
    const params = new URLSearchParams();

    if (filters?.nome) params.append('nome', filters.nome);
    if (filters?.cpf) params.append('cpf', filters.cpf);

    params.append('page', String(page));
    params.append('size', String(size));

    const response = await apiClient.get<TutorListApiResponse>(
      `${this.baseUrl}?${params.toString()}`
    );

    return {
      ...response.data,
      content: response.data.content.map((dto) => this.transformTutorDto(dto)),
    };
  }

  async getById(id: number): Promise<Tutor> {
    const response = await apiClient.get<TutorApiDto>(`${this.baseUrl}/${id}`);
    return this.transformTutorDto(response.data);
  }

  async create(data: CreateTutorDto): Promise<Tutor> {
    const response = await apiClient.post<TutorApiDto>(this.baseUrl, data);
    return this.transformTutorDto(response.data);
  }

  async update(id: number, data: CreateTutorDto): Promise<Tutor> {
    const response = await apiClient.put<TutorApiDto>(`${this.baseUrl}/${id}`, data);
    return this.transformTutorDto(response.data);
  }

  async uploadPhoto(tutorId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('foto', file);

    await apiClient.post(`${this.baseUrl}/${tutorId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deletePhoto(tutorId: number, fotoId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${tutorId}/fotos/${fotoId}`);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async linkPet(tutorId: number, petId: number): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${tutorId}/pets/${petId}`);
  }

  async unlinkPet(tutorId: number, petId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${tutorId}/pets/${petId}`);
  }
}

export const tutorService = new TutorService();
