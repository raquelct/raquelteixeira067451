import { petService, type PetService } from '../services/pet.service';
import { petStore, type PetStore } from '../state/PetStore';
import type { Pet, PetFormData, PetFilters } from '../types/pet.types';
import type { Observable } from 'rxjs';
import type { PetState } from '../state/PetStore';
import type { Optional } from '../types/optional';
import { BaseFacade } from './base/BaseFacade';
import { RequestDeduplicator } from './base/RequestDeduplicator';
import { PetMapper } from '../domain/pet/PetMapper';
import { PetValidator } from '../domain/pet/PetValidator';
import { logger } from '../utils/logger';

interface PetFacadeDependencies {
  petService: PetService;
  petStore: PetStore;
}

export class PetFacade extends BaseFacade<PetStore> {
  protected store: PetStore;
  private deduplicator = new RequestDeduplicator();
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
    const requestKey = this.createRequestKey('fetchPets', filters, currentPage, currentSize);

    return this.deduplicator.deduplicate(requestKey, () =>
      this.executeWithLoading(async () => {
        const response = await this.deps.petService.getAll(filters, currentPage, currentSize);
        this.deps.petStore.setPets(response.content, response.total, response.page, response.size);
      })
    );
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
      const normalizedData = PetMapper.toCreateDto(data);
      const createdPet = await this.deps.petService.create(normalizedData);

      if (imageFile) {
        await this.uploadPetPhoto(createdPet.id, imageFile);
      }

      await this.fetchPets();
      return createdPet;
    });
  }

  async updatePet(id: number, data: PetFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Pet> {
    return this.executeWithLoading(async () => {
      PetValidator.validateOrThrow(data);

      if (isImageRemoved && currentPhotoId) {
        await this.deps.petService.deletePhoto(id, currentPhotoId).catch((err: Error) => {
          logger.error('Error deleting photo', {
            context: 'PetFacade.updatePet',
            petId: id,
            photoId: currentPhotoId,
            error: err.message,
          });
        });
      }

      const normalizedData = PetMapper.normalize(data);
      const updatedPet = await this.deps.petService.update(id, normalizedData);

      if (imageFile) {
        await this.deps.petService.uploadPhoto(updatedPet.id, imageFile).catch((err: Error) => {
          logger.error('Error uploading photo', {
            context: 'PetFacade.updatePet',
            petId: updatedPet.id,
            error: err.message,
          });
        });
      }

      await this.fetchPets();
      return updatedPet;
    });
  }

  deletePet = async (id: number): Promise<void> => {
    return this.executeWithLoading(async () => {
      await this.deps.petService.delete(id);
      this.deps.petStore.removePet(id);
    });
  };

  setCurrentPet(pet: Optional<Pet>): void {
    this.deps.petStore.setCurrentPet(pet);
  }

  clear(): void {
    this.deps.petStore.clear();
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
