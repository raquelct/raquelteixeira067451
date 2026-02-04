import { petService, type PetService } from '../services/pet.service';
import { petStore, type PetStore } from '../state/PetStore';
import type { Pet, CreatePetDto, PetFormData, PetFilters } from '../types/pet.types';
import type { Observable } from 'rxjs';
import type { PetState } from '../state/PetStore';
import type { Optional } from '../types/optional';
import { BaseFacade } from './base/BaseFacade';
import { PAGINATION } from '../constants/pagination';

interface PetFacadeDependencies {
  petService: PetService;
  petStore: PetStore;
}

export class PetFacade extends BaseFacade<PetStore> {
  protected store: PetStore;
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private deps: PetFacadeDependencies;

  constructor(deps: PetFacadeDependencies) {
    super();
    this.deps = deps;
    this.store = deps.petStore;
  }

  getPetState(): Observable<PetState> {
    return this.deps.petStore.getPetState();
  }

  get pets$(): Observable<Pet[]> {
    return this.deps.petStore.pets$;
  }

  get currentPet$(): Observable<Optional<Pet>> {
    return this.deps.petStore.currentPet$;
  }

  get isLoading$(): Observable<boolean> {
    return this.deps.petStore.isLoading$;
  }

  get error$(): Observable<Optional<string>> {
    return this.deps.petStore.error$;
  }

  get totalCount$(): Observable<number> {
    return this.deps.petStore.totalCount$;
  }

  getPets(): Pet[] {
    return this.deps.petStore.getPets();
  }

  getCurrentPet(): Optional<Pet> {
    return this.deps.petStore.getCurrentPet();
  }

  async fetchPets(filters?: PetFilters, page?: number, size?: number): Promise<void> {
    const currentState = this.deps.petStore.getCurrentState();
    const currentPage = page ?? currentState.currentPage;
    const currentSize = size ?? currentState.pageSize;
    const filterKey = filters 
      ? Object.keys(filters).sort().map(k => `${k}:${filters[k as keyof PetFilters]}`).join('|') 
      : 'all';
    
    const requestKey = `fetchPets-${filterKey}-${currentPage}-${currentSize}`;

    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey) as Promise<void>;
    }

    const requestPromise = this.executeWithLoading(async () => {
      const response = await this.deps.petService.getAll(filters, currentPage, currentSize);
      this.deps.petStore.setPets(response.content, response.total, response.page, response.size);
    }).finally(() => {
      this.pendingRequests.delete(requestKey);
    });
    this.pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  async fetchPetById(id: number): Promise<Pet> {
    return this.executeWithLoading(async () => {
      const pet = await this.deps.petService.getById(id);
      this.deps.petStore.setCurrentPet(pet);
      return pet;
    });
  }

  async createPet(data: PetFormData, imageFile?: File): Promise<Pet> {
    return this.executeWithLoading(async () => {
      const normalizedData = this.prepareCreateData(data);
      const createdPet = await this.deps.petService.create(normalizedData);

      if (imageFile) {
        await this.uploadPetPhoto(createdPet.id, imageFile);
      }

      await this.fetchPets(undefined, PAGINATION.INITIAL_PAGE, PAGINATION.DEFAULT_PAGE_SIZE);
      return createdPet;
    });
  }

  async updatePet(id: number, data: PetFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Pet> {
    return this.executeWithLoading(async () => {
      this.validatePetData(data);

      if (isImageRemoved && currentPhotoId) {
        await this.deps.petService.deletePhoto(id, currentPhotoId).catch(err => {
          console.error('Error deleting photo:', err);
        });
      }

      const normalizedData = this.normalizePetData(data);
      const updatedPet = await this.deps.petService.update(id, normalizedData);

      if (imageFile) {
        await this.deps.petService.uploadPhoto(updatedPet.id, imageFile).catch(err => {
          console.error('Error uploading photo:', err);
        });
      }

      await this.fetchPets(undefined, PAGINATION.INITIAL_PAGE, PAGINATION.DEFAULT_PAGE_SIZE);
      return updatedPet;
    });
  }

  async deletePet(id: number): Promise<void> {
    return this.executeWithLoading(async () => {
      await this.deps.petService.delete(id);
      this.deps.petStore.removePet(id);
    });
  }

  setCurrentPet(pet: Optional<Pet>): void {
    this.deps.petStore.setCurrentPet(pet);
  }

  clear(): void {
    this.deps.petStore.clear();
  }

  private validatePetData(data: Partial<CreatePetDto>): void {
    if (data.nome && data.nome.trim().length < 3) {
      throw new Error('Nome do pet deve ter no mínimo 3 caracteres');
    }

    if (data.raca && data.raca.trim().length < 2) {
      throw new Error('Raça do pet deve ter no mínimo 2 caracteres');
    }

    if (data.idade !== undefined && (data.idade < 0 || data.idade > 100)) {
      throw new Error('Idade do pet deve estar entre 0 e 100 anos');
    }
  }

  private normalizePetData<T extends Partial<CreatePetDto>>(data: T): T {
    return {
      ...data,
      nome: data.nome?.trim() as T['nome'],
      raca: data.raca?.trim() as T['raca'],
    } as T;
  }

  private prepareCreateData(data: PetFormData): CreatePetDto {
    const createData: CreatePetDto = {
      nome: data.nome,
      raca: data.raca,
      idade: data.idade,
    };

    this.validatePetData(createData);
    return this.normalizePetData(createData);
  }

  private async uploadPetPhoto(petId: number, file: File): Promise<void> {
    await this.deps.petService.uploadPhoto(petId, file);
  }

  formatPetAge(ageInYears?: number): string {
    if (ageInYears === undefined || ageInYears === null) {
      return 'Idade não informada';
    }

    if (ageInYears < 1) {
      const months = Math.round(ageInYears * 12);
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }

    return `${ageInYears} ${ageInYears === 1 ? 'ano' : 'anos'}`;
  }
}

export const petFacade = new PetFacade({
  petService,
  petStore,
});

export const createPetFacade = (deps: Partial<PetFacadeDependencies> = {}): PetFacade => {
  return new PetFacade({
    petService: deps.petService || petService,
    petStore: deps.petStore || petStore,
  });
};
