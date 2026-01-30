import { tutorService } from '../services/tutor.service';
import { tutorStore } from '../state/TutorStore';
import type { Tutor, CreateTutorDto, TutorFormData, TutorFilters } from '../types/tutor.types';
import type { Observable } from 'rxjs';

/**
 * TutorFacade - Padrão Facade para Tutores
 */
export class TutorFacade {
  get tutores$(): Observable<Tutor[]> {
    return tutorStore.tutores$;
  }

  get currentTutor$(): Observable<Tutor | null> {
    return tutorStore.currentTutor$;
  }

  get isLoading$(): Observable<boolean> {
    return tutorStore.isLoading$;
  }

  get error$(): Observable<string | null> {
    return tutorStore.error$;
  }

  get totalCount$(): Observable<number> {
    return tutorStore.totalCount$;
  }

  async fetchTutores(filters?: TutorFilters, page = 0, size = 10): Promise<void> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      const response = await tutorService.getAll(filters, page, size);
      
      tutorStore.setTutores(response.content, response.total, response.page);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar tutores');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] fetchTutores error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  async fetchTutorById(id: string): Promise<void> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      const tutor = await tutorService.getById(id);
      
      tutorStore.setCurrentTutor(tutor);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar tutor');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] fetchTutorById error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  async createTutor(data: TutorFormData, imageFile?: File): Promise<Tutor> {
    let createdTutor: Tutor | null = null;

    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      const createData: CreateTutorDto = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        endereco: data.endereco,
        cpf: data.cpf,
      };

      this.validateTutorData(createData);
      const normalizedData = this.normalizeTutorData(createData);

      console.log('[TutorFacade] Criando tutor...');
      createdTutor = await tutorService.create(normalizedData);
      console.log('[TutorFacade] Tutor criado, ID:', createdTutor.id);

      if (imageFile && createdTutor.id) {
        console.log('[TutorFacade] Iniciando upload de foto...');
        try {
          await tutorService.uploadPhoto(createdTutor.id, imageFile);
          console.log('[TutorFacade] Upload concluído');
        } catch (uploadError) {
          console.error('[TutorFacade] Erro no upload:', uploadError);
          alert('Tutor criado com sucesso, mas houve erro ao enviar a foto.');
        }
      }

      console.log('[TutorFacade] Atualizando lista...');
      await this.fetchTutores(undefined, 0, 10);

      return createdTutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao criar tutor');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] createTutor error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  async deleteTutor(id: string): Promise<void> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      await tutorService.delete(id);
      
      tutorStore.removeTutor(id);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao remover tutor');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] deleteTutor error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  setCurrentTutor(tutor: Tutor | null): void {
    tutorStore.setCurrentTutor(tutor);
  }

  clear(): void {
    tutorStore.clear();
  }

  private validateTutorData(data: Partial<CreateTutorDto>): void {
    if (data.nome && data.nome.trim().length < 3) {
      throw new Error('Nome do tutor deve ter no mínimo 3 caracteres');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.telefone && data.telefone.trim().length < 10) {
      throw new Error('Telefone inválido');
    }
  }

  private normalizeTutorData<T extends Partial<CreateTutorDto>>(data: T): T {
    return {
      ...data,
      nome: data.nome?.trim() as T['nome'],
      email: data.email?.trim().toLowerCase() as T['email'],
      telefone: data.telefone?.replace(/\D/g, '') as T['telefone'],
      endereco: data.endereco?.trim() as T['endereco'],
      cpf: data.cpf?.replace(/\D/g, '') as T['cpf'],
    } as T;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidCPF(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;
    
    return true;
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

export const tutorFacade = new TutorFacade();
