import { tutorService, type TutorService } from '../services/tutor.service';
import { tutorStore, type TutorStore } from '../state/TutorStore';
import type { Tutor, TutorFormData, TutorFilters } from '../types/tutor.types';
import type { Observable } from 'rxjs';
import type { Optional } from '../types/optional';
import { BaseFacade } from './base/BaseFacade';
import { RequestDeduplicator } from './base/RequestDeduplicator';
import { TutorMapper } from '../domain/tutor/TutorMapper';
import { tutorSchema } from '../schemas/tutorSchema';
import { logger } from '../utils/logger';

interface TutorFacadeDependencies {
  tutorService: TutorService;
  tutorStore: TutorStore;
}

export class TutorFacade extends BaseFacade<TutorStore> {
  protected store: TutorStore;
  private deps: TutorFacadeDependencies;
  private deduplicator = new RequestDeduplicator();

  constructor(deps: TutorFacadeDependencies) {
    super();
    this.deps = deps;
    this.store = deps.tutorStore;
  }
  
  get tutores$(): Observable<Tutor[]> {
    return this.deps.tutorStore.tutores$;
  }

  get currentTutor$(): Observable<Optional<Tutor>> {
    return this.deps.tutorStore.currentTutor$;
  }

  get isLoading$(): Observable<boolean> {
    return this.deps.tutorStore.isLoading$;
  }

  get error$(): Observable<Optional<string>> {
    return this.deps.tutorStore.error$;
  }

  get totalCount$(): Observable<number> {
    return this.deps.tutorStore.totalCount$;
  }

  async fetchTutores(filters?: TutorFilters, page = 0, size = 10): Promise<void> {
    const requestKey = this.createRequestKey('fetchTutores', filters, page, size);
    
    return this.deduplicator.deduplicate(requestKey, () =>
      this.executeWithLoading(async () => {
        const response = await this.deps.tutorService.getAll(filters, page, size);
        this.deps.tutorStore.setTutores(response.content, response.total, response.page);
      })
    );
  }

  async fetchTutorById(id: number): Promise<Tutor> {
    return this.executeWithLoading(async () => {
      const tutor = await this.deps.tutorService.getById(id);
      this.deps.tutorStore.setCurrentTutor(tutor);
      return tutor;
    });
  }

  async createTutor(data: TutorFormData, imageFile?: File, pendingPetIds?: number[]): Promise<Tutor> {
    return this.executeWithLoading(async () => {
      tutorSchema.parse(data);
      const normalizedData = TutorMapper.toCreateDto(data);
      const createdTutor = await this.deps.tutorService.create(normalizedData);

      if (imageFile) {
        await this.uploadTutorPhoto(createdTutor.id, imageFile).catch((err: Error) => {
          logger.error('Photo upload failed', {
            context: 'TutorFacade.createTutor',
            tutorId: createdTutor.id,
            error: err.message,
          });
        });
      }

      if (pendingPetIds && pendingPetIds.length > 0) {
        await this.linkPendingPets(createdTutor.id, pendingPetIds).catch((err: Error) => {
          logger.error('Pet linking failed', {
            context: 'TutorFacade.createTutor',
            tutorId: createdTutor.id,
            petIds: pendingPetIds,
            error: err.message,
          });
        });
      }

      await this.fetchTutores();
      return createdTutor;
    });
  }

  async updateTutor(id: number, data: TutorFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Tutor> {
    return this.executeWithLoading(async () => {
      tutorSchema.parse(data);

      if (isImageRemoved && currentPhotoId) {
        await this.deps.tutorService.deletePhoto(id, currentPhotoId).catch((err: Error) => {
          logger.error('Error removing old photo', {
            context: 'TutorFacade.updateTutor',
            tutorId: id,
            photoId: currentPhotoId,
            error: err.message,
          });
        });
      }

      const normalizedData = TutorMapper.normalize(data);
      const updatedTutor = await this.deps.tutorService.update(id, normalizedData);

      if (imageFile) {
        await this.deps.tutorService.uploadPhoto(updatedTutor.id, imageFile).catch((err: Error) => {
          logger.error('Error uploading new photo', {
            context: 'TutorFacade.updateTutor',
            tutorId: updatedTutor.id,
            error: err.message,
          });
        });
      }
      await this.fetchTutores();
      return updatedTutor;
    });
  }

  deleteTutor = async (id: number): Promise<void> => {
    return this.executeWithLoading(async () => {
      await this.deps.tutorService.delete(id);
      this.deps.tutorStore.removeTutor(id);
    });
  };

  async linkPetToTutor(tutorId: number, petId: number): Promise<void> {
    return this.executeWithLoading(async () => {
      await this.deps.tutorService.linkPet(tutorId, petId);
    });
  }

  async removePetFromTutor(tutorId: number, petId: number): Promise<void> {
    return this.executeWithLoading(async () => {
      await this.deps.tutorService.unlinkPet(tutorId, petId);
    });
  }

  setCurrentTutor(tutor: Optional<Tutor>): void {
    this.deps.tutorStore.setCurrentTutor(tutor);
  }

  clear(): void {
    this.deps.tutorStore.clear();
  }

  private async uploadTutorPhoto(tutorId: number, file: File): Promise<void> {
    await this.deps.tutorService.uploadPhoto(tutorId, file);
  }

  private async linkPendingPets(tutorId: number, petIds: number[]): Promise<void> {
    await Promise.all(
      petIds.map((petId) => this.deps.tutorService.linkPet(tutorId, petId))
    );
  }
}

export const tutorFacade = new TutorFacade({
  tutorService,
  tutorStore,
});

export const createTutorFacade = (deps: Partial<TutorFacadeDependencies> = {}): TutorFacade => {
  return new TutorFacade({
    tutorService: deps.tutorService || tutorService,
    tutorStore: deps.tutorStore || tutorStore,
  });
};
