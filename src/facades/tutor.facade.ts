import { tutorService, type TutorService } from '../services/tutor.service';
import { tutorStore, type TutorStore } from '../state/TutorStore';
import type { Tutor, CreateTutorDto, TutorFormData, TutorFilters } from '../types/tutor.types';
import type { Observable } from 'rxjs';
import type { Optional } from '../types/optional';
import { BaseFacade } from './base/BaseFacade';
import { RequestDeduplicator } from './base/RequestDeduplicator';
import { PAGINATION } from '../constants/pagination';

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
      const normalizedData = this.prepareCreateData(data);
      const createdTutor = await this.deps.tutorService.create(normalizedData);

      if (imageFile) {
        await this.uploadTutorPhoto(createdTutor.id, imageFile).catch(err => {
          console.error('Photo upload failed:', err);
        });
      }

      if (pendingPetIds && pendingPetIds.length > 0) {
        await this.linkPendingPets(createdTutor.id, pendingPetIds).catch(err => {
          console.error('Pet linking failed:', err);
        });
      }

      await this.fetchTutores(undefined, PAGINATION.INITIAL_PAGE, PAGINATION.DEFAULT_PAGE_SIZE);
      return createdTutor;
    });
  }

  async updateTutor(id: number, data: TutorFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Tutor> {
    return this.executeWithLoading(async () => {
      this.validateTutorData(data);

      if (isImageRemoved && currentPhotoId) {
        await this.deps.tutorService.deletePhoto(id, currentPhotoId).catch(err => {
          console.error('Error removing old photo:', err);
        });
      }

      const normalizedData = this.normalizeTutorData(data);
      const updatedTutor = await this.deps.tutorService.update(id, normalizedData);

      if (imageFile) {
        await this.deps.tutorService.uploadPhoto(updatedTutor.id, imageFile).catch(err => {
          console.error('Error uploading new photo:', err);
        });
      }
      await this.fetchTutores(undefined, PAGINATION.INITIAL_PAGE, PAGINATION.DEFAULT_PAGE_SIZE);
      return updatedTutor;
    });
  }

  async deleteTutor(id: number): Promise<void> {
    return this.executeWithLoading(async () => {
      await this.deps.tutorService.delete(id);
      this.deps.tutorStore.removeTutor(id);
    });
  }

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

  private validateTutorData(data: Partial<CreateTutorDto>): void {
    if (data.nome && String(data.nome).trim().length < 3) {
      throw new Error('Nome do tutor deve ter no mínimo 3 caracteres');
    }

    if (data.email && !this.isValidEmail(String(data.email))) {
      throw new Error('Email inválido');
    }

    if (data.telefone && String(data.telefone).replace(/\D/g, '').length < 10) {
      throw new Error('Telefone inválido');
    }
  }

  private normalizeTutorData<T extends Partial<CreateTutorDto>>(data: T): T {
    const normalizeString = (value: unknown) => {
      if (!value) return undefined;
      return String(value).trim();
    };

    const normalizeDigits = (value: unknown) => {
      if (!value) return undefined;
      return String(value).replace(/\D/g, '');
    };

    return {
      ...data,
      nome: normalizeString(data.nome) as T['nome'],
      email: normalizeString(data.email)?.toLowerCase() as T['email'],
      telefone: normalizeDigits(data.telefone) as T['telefone'],
      endereco: normalizeString(data.endereco) as T['endereco'],
      cpf: normalizeDigits(data.cpf) as T['cpf'],
    } as T;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private prepareCreateData(data: TutorFormData): CreateTutorDto {
    const createData: CreateTutorDto = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      endereco: data.endereco,
      cpf: data.cpf,
    };

    this.validateTutorData(createData);
    return this.normalizeTutorData(createData);
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
