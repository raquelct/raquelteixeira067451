import { tutorService, type TutorService } from '../services/tutor.service';
import { tutorStore, type TutorStore } from '../state/TutorStore';
import type { Tutor, CreateTutorDto, TutorFormData, TutorFilters } from '../types/tutor.types';
import type { Observable } from 'rxjs';
import type { Optional } from '../types/optional';
import { toast } from 'react-hot-toast';

interface TutorFacadeDependencies {
  tutorService: TutorService;
  tutorStore: TutorStore;
  toastService: typeof toast;
}

export class TutorFacade {
  private deps: TutorFacadeDependencies;

  constructor(deps: TutorFacadeDependencies) {
    this.deps = deps;
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
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      const response = await this.deps.tutorService.getAll(filters, page, size);

      this.deps.tutorStore.setTutores(response.content, response.total, response.page);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar tutores');
      this.deps.tutorStore.setError(errorMessage);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async fetchTutorById(id: number): Promise<Tutor> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      const tutor = await this.deps.tutorService.getById(id);

      this.deps.tutorStore.setCurrentTutor(tutor);

      return tutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar tutor');
      this.deps.tutorStore.setError(errorMessage);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async createTutor(data: TutorFormData, imageFile?: File, pendingPetIds?: number[]): Promise<Tutor> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);
      const normalizedData = this.prepareCreateData(data);

      const createdTutor = await this.deps.tutorService.create(normalizedData);

      if (imageFile) {
        await this.uploadTutorPhoto(createdTutor.id, imageFile);
      }

      if (pendingPetIds && pendingPetIds.length > 0) {
        await this.linkPendingPets(createdTutor.id, pendingPetIds);
      }

      await this.fetchTutores(undefined, 0, 10);

      this.deps.toastService.success('Tutor criado com sucesso!');
      return createdTutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao criar tutor');
      this.deps.tutorStore.setError(errorMessage);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async updateTutor(id: number, data: TutorFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Tutor> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      this.validateTutorData(data);

      if (isImageRemoved && currentPhotoId) {
        try {
          await this.deps.tutorService.deletePhoto(id, currentPhotoId);
        } catch (deleteError) {
          // Não bloqueia atualização, mas informa usuário
          this.deps.toastService.error('Não foi possível remover a foto anterior');
        }
      }

      const normalizedData = this.normalizeTutorData(data);
      const updatedTutor = await this.deps.tutorService.update(id, normalizedData);

      if (imageFile) {
        try {
          await this.deps.tutorService.uploadPhoto(updatedTutor.id, imageFile);
        } catch (uploadError) {
          // Não bloqueia atualização, mas informa usuário
          this.deps.toastService.error('Não foi possível enviar a nova foto');
        }
      }
      await this.fetchTutores(undefined, 0, 10);

      this.deps.toastService.success('Tutor atualizado com sucesso!');
      return updatedTutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao atualizar tutor');
      this.deps.tutorStore.setError(errorMessage);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async deleteTutor(id: number): Promise<void> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      await this.deps.tutorService.delete(id);

      this.deps.tutorStore.removeTutor(id);
      this.deps.toastService.success('Tutor removido com sucesso!');
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao remover tutor');
      this.deps.tutorStore.setError(errorMessage);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async linkPetToTutor(tutorId: number, petId: number): Promise<void> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      await this.deps.tutorService.linkPet(tutorId, petId);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao vincular pet');
      this.deps.tutorStore.setError(errorMessage);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async removePetFromTutor(tutorId: number, petId: number): Promise<void> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      await this.deps.tutorService.unlinkPet(tutorId, petId);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao remover vínculo');
      this.deps.tutorStore.setError(errorMessage);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
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



  private formatErrorMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
    }

    return defaultMessage;
  }
}

export const tutorFacade = new TutorFacade({
  tutorService,
  tutorStore,
  toastService: toast,
});

export const createTutorFacade = (deps: Partial<TutorFacadeDependencies> = {}): TutorFacade => {
  return new TutorFacade({
    tutorService: deps.tutorService || tutorService,
    tutorStore: deps.tutorStore || tutorStore,
    toastService: deps.toastService || toast,
  });
};
