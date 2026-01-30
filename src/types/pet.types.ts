/**
 * Tipos relacionados a Pets
 * Para futuras implementações do CRUD
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
  photo?: string;
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
  species?: Pet['species'];
  ownerCpf?: string;
  vaccinated?: boolean;
  neutered?: boolean;
}

export interface PetListResponse {
  pets: Pet[];
  total: number;
  page: number;
  limit: number;
}
