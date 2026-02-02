import { petService } from '../services/pet.service';
import { petStore } from '../state/PetStore';
import type { Pet, CreatePetDto, PetFormData, PetFilters } from '../types/pet.types';
import type { Observable } from 'rxjs';
import type { PetState } from '../state/PetStore';
import type { Optional } from '../types/optional';
import { toast } from 'react-hot-toast';


export class PetFacade {
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  getPetState(): Observable<PetState> {
    return petStore.getPetState();
  }

  get pets$(): Observable<Pet[]> {
    return petStore.pets$;
  }

  get currentPet$(): Observable<Optional<Pet>> {
    return petStore.currentPet$;
  }

  get isLoading$(): Observable<boolean> {
    return petStore.isLoading$;
  }

  get error$(): Observable<Optional<string>> {
    return petStore.error$;
  }


  get totalCount$(): Observable<number> {
    return petStore.totalCount$;
  }

  getPets(): Pet[] {
    return petStore.getPets();
  }


  getCurrentPet(): Optional<Pet> {
    return petStore.getCurrentPet();
  }


  async fetchPets(filters?: PetFilters, page = 1, size = 10): Promise<void> {
    const requestKey = `fetchPets-${JSON.stringify(filters)}-${page}-${size}`;

    if (this.pendingRequests.has(requestKey)) {
      console.log('[PetFacade] Requisição duplicada detectada, aguardando existente...');
      return this.pendingRequests.get(requestKey) as Promise<void>;
    }

    const requestPromise = (async () => {
      try {
        petStore.setLoading(true);
        petStore.setError(undefined);

        const response = await petService.getAll(filters, page, size);

        petStore.setPets(response.content, response.total, response.page);
      } catch (error) {
        const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar pets');
        petStore.setError(errorMessage);
        console.error('[PetFacade] fetchPets error:', error);
        throw error;
      } finally {
        petStore.setLoading(false);
        this.pendingRequests.delete(requestKey);
      }
    })();
    this.pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  async fetchPetById(id: number): Promise<Pet> {
    try {
      petStore.setLoading(true);
      petStore.setError(undefined);

      const pet = await petService.getById(id);

      petStore.setCurrentPet(pet);
      return pet;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar pet');
      petStore.setError(errorMessage);
      console.error('[PetFacade] fetchPetById error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  async fetchPetsByTutor(cpf: string): Promise<void> {
    try {
      petStore.setLoading(true);
      petStore.setError(undefined);

      const pets = await petService.getByTutorCpf(cpf);

      petStore.setPets(pets);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar pets do tutor');
      petStore.setError(errorMessage);
      console.error('[PetFacade] fetchPetsByTutor error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  async createPet(data: PetFormData, imageFile?: File): Promise<Pet> {
    try {
      petStore.setLoading(true);
      petStore.setError(undefined);

      const normalizedData = this.prepareCreateData(data);

      const createdPet = await petService.create(normalizedData);

      if (imageFile) {
        await this.uploadPetPhoto(createdPet.id, imageFile);
      }

      await this.fetchPets(undefined, 0, 10);

      toast.success('Pet criado com sucesso!');
      return createdPet;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao criar pet');
      petStore.setError(errorMessage);
      console.error('[PetFacade] createPet error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }


  async updatePet(id: number, data: PetFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Pet> {
    try {
      petStore.setLoading(true);
      petStore.setError(undefined);

      this.validatePetData(data);

      if (isImageRemoved && currentPhotoId) {
        try {
          console.log(`[PetFacade] Removendo foto ${currentPhotoId} do pet ${id}...`);
          await petService.deletePhoto(id, currentPhotoId);
          console.log('[PetFacade] Foto removida com sucesso');
        } catch (deleteError) {
          console.warn('[PetFacade] Falha ao remover foto (pode já ter sido removida):', deleteError);
        }
      }

      const normalizedData = this.normalizePetData(data);

      const updatedPet = await petService.update(id, normalizedData);

      if (imageFile) {
        try {
          await petService.uploadPhoto(Number(updatedPet.id), imageFile);
        } catch (uploadError) {
          console.warn('[PetFacade] Falha no upload da foto:', uploadError);
        }
      }

      await this.fetchPets(undefined, 0, 10);

      toast.success('Pet atualizado com sucesso!');
      return updatedPet;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao atualizar pet');
      petStore.setError(errorMessage);
      console.error('[PetFacade] updatePet error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  async deletePet(id: number): Promise<void> {
    try {
      petStore.setLoading(true);
      petStore.setError(undefined);

      await petService.delete(id);

      petStore.removePet(id);

      toast.success('Pet removido com sucesso!');
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao remover pet');
      petStore.setError(errorMessage);
      console.error('[PetFacade] deletePet error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  setCurrentPet(pet: Optional<Pet>): void {
    petStore.setCurrentPet(pet);
  }

  clear(): void {
    petStore.clear();
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
    try {
      await petService.uploadPhoto(petId, file);
    } catch (error) {
      console.error('[PetFacade] Erro ao fazer upload da foto:', error);
      toast.error('Pet criado, mas houve erro ao fazer upload da foto');
    }
  }

  private formatErrorMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return axiosError.response?.data?.message || defaultMessage;
    }

    return defaultMessage;
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


  formatPetWeight(weightInKg?: number): string {
    if (weightInKg === undefined || weightInKg === null) {
      return 'Peso não informado';
    }

    return `${weightInKg.toFixed(1)} kg`;
  }
}

export const petFacade = new PetFacade();
