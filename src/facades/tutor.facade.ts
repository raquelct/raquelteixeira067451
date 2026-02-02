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
      console.error('[TutorFacade] fetchTutores error:', error);
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
      console.error('[TutorFacade] fetchTutorById error:', error);
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

      console.log('[TutorFacade] Criando tutor...');
      const createdTutor = await this.deps.tutorService.create(normalizedData);
      console.log('[TutorFacade] Tutor criado, ID:', createdTutor.id);

      if (imageFile) {
        await this.uploadTutorPhoto(createdTutor.id, imageFile);
      }

      if (pendingPetIds && pendingPetIds.length > 0) {
        await this.linkPendingPets(createdTutor.id, pendingPetIds);
      }

      console.log('[TutorFacade] Atualizando lista...');
      await this.fetchTutores(undefined, 0, 10);

      this.deps.toastService.success('Tutor criado com sucesso!');
      return createdTutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao criar tutor');
      this.deps.tutorStore.setError(errorMessage);
      console.error('[TutorFacade] createTutor error:', error);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }


  async updateTutor(id: number, data: TutorFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Tutor> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      console.log('[TutorFacade] Validando dados do tutor...');
      this.validateTutorData(data);

      if (isImageRemoved && currentPhotoId) {
        try {
          console.log(`[TutorFacade] Removendo foto ${currentPhotoId} do tutor ${id}...`);
          await this.deps.tutorService.deletePhoto(id, currentPhotoId);
          console.log('[TutorFacade] Foto removida com sucesso');
        } catch (deleteError) {
          console.warn('[TutorFacade] Falha ao remover foto (pode já ter sido removida):', deleteError);
        }
      }

      console.log('[TutorFacade] Normalizando dados do tutor...');
      const normalizedData = this.normalizeTutorData(data);

      console.log('[TutorFacade] Atualizando tutor via API...');
      const updatedTutor = await this.deps.tutorService.update(id, normalizedData);
      console.log('[TutorFacade] Tutor atualizado:', updatedTutor);

      if (imageFile) {
        try {
          console.log('[TutorFacade] Fazendo upload da foto...');
          await this.deps.tutorService.uploadPhoto((updatedTutor.id), imageFile);
          console.log('[TutorFacade] Foto enviada com sucesso');
        } catch (uploadError) {
          console.warn('[TutorFacade] Falha no upload da foto:', uploadError);
        }
      }

      console.log('[TutorFacade] Atualizando lista...');
      await this.fetchTutores(undefined, 0, 10);

      this.deps.toastService.success('Tutor atualizado com sucesso!');
      return updatedTutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao atualizar tutor');
      this.deps.tutorStore.setError(errorMessage);
      console.error('[TutorFacade] updateTutor error:', error);
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
      console.error('[TutorFacade] deleteTutor error:', error);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async linkPetToTutor(tutorId: number, petId: number): Promise<void> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      console.log('[TutorFacade] Vinculando pet', petId, 'ao tutor', tutorId);

      await this.deps.tutorService.linkPet(tutorId, petId);

      await this.fetchTutorById(tutorId);

      console.log('[TutorFacade] Pet vinculado com sucesso');
      this.deps.toastService.success('Pet vinculado com sucesso!');
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao vincular pet');
      this.deps.tutorStore.setError(errorMessage);
      console.error('[TutorFacade] linkPetToTutor error:', error);
      throw error;
    } finally {
      this.deps.tutorStore.setLoading(false);
    }
  }

  async removePetFromTutor(tutorId: number, petId: number): Promise<void> {
    try {
      this.deps.tutorStore.setLoading(true);
      this.deps.tutorStore.setError(undefined);

      console.log('[TutorFacade] Removendo vínculo do pet', petId, 'do tutor', tutorId);

      await this.deps.tutorService.unlinkPet(tutorId, petId);

      await this.fetchTutorById(tutorId);

      console.log('[TutorFacade] Vínculo removido com sucesso');
      this.deps.toastService.success('Vínculo removido com sucesso!');
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao remover vínculo');
      this.deps.tutorStore.setError(errorMessage);
      console.error('[TutorFacade] removePetFromTutor error:', error);
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
    console.log('[TutorFacade] Iniciando upload de foto...');
    try {
      await this.deps.tutorService.uploadPhoto(tutorId, file);
      console.log('[TutorFacade] Upload concluído');
    } catch (error) {
      console.error('[TutorFacade] Erro no upload:', error);
      this.deps.toastService.error('Tutor criado, mas houve erro ao fazer upload da foto');
    }
  }

  private async linkPendingPets(tutorId: number, petIds: number[]): Promise<void> {
    console.log('[TutorFacade] Vinculando pets:', petIds);
    try {
      await Promise.all(
        petIds.map((petId) => this.deps.tutorService.linkPet(tutorId, petId))
      );
      console.log('[TutorFacade] Pets vinculados com sucesso');
    } catch (error) {
      console.error('[TutorFacade] Erro ao vincular pets:', error);
      this.deps.toastService.error('Tutor criado, mas houve erro ao vincular alguns pets');
    }
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
