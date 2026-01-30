import { petService } from '../services/pet.service';
import { petStore } from '../state/PetStore';
import type { Pet, CreatePetDto, PetFilters } from '../types/pet.types';
import type { Observable } from 'rxjs';
import type { PetState } from '../state/PetStore';

/**
 * PetFacade - Padrão Facade para Pets
 * 
 * Responsabilidades de Nível Sênior:
 * - Interface única entre UI Components e a camada de dados
 * - Orquestra PetService + PetStore
 * - Gerencia loading states e error handling
 * - Transforma dados e aplica lógica de negócio
 * - Expõe observables reativos para a UI
 * - Implementa retry logic e validações
 * 
 * UI Components DEVEM usar APENAS este Facade.
 * NUNCA importar PetService ou axios diretamente.
 * 
 * Arquitetura:
 * Component → Facade → Service → API
 *                ↓
 *              Store (BehaviorSubject)
 */
export class PetFacade {
  // ========== Observables Reativos ==========

  /**
   * Observable do estado completo
   */
  getPetState(): Observable<PetState> {
    return petStore.getPetState();
  }

  /**
   * Observable da lista de pets
   * UI subscribe para atualização automática
   */
  get pets$(): Observable<Pet[]> {
    return petStore.pets$;
  }

  /**
   * Observable do pet atual (para detalhes/edição)
   */
  get currentPet$(): Observable<Pet | null> {
    return petStore.currentPet$;
  }

  /**
   * Observable do loading state
   */
  get isLoading$(): Observable<boolean> {
    return petStore.isLoading$;
  }

  /**
   * Observable do error state
   */
  get error$(): Observable<string | null> {
    return petStore.error$;
  }

  /**
   * Observable do total count (para paginação)
   */
  get totalCount$(): Observable<number> {
    return petStore.totalCount$;
  }

  // ========== Getters Síncronos (Snapshots) ==========

  /**
   * Retorna lista de pets atual (snapshot)
   */
  getPets(): Pet[] {
    return petStore.getPets();
  }

  /**
   * Retorna pet atual (snapshot)
   */
  getCurrentPet(): Pet | null {
    return petStore.getCurrentPet();
  }

  // ========== Métodos de Negócio ==========

  /**
   * Busca todos os pets com filtros opcionais
   * 
   * Fluxo:
   * 1. Set loading = true
   * 2. Chama PetService.getAll()
   * 3. Atualiza PetStore com resultado
   * 4. Set loading = false
   * 5. Emite para todos os subscribers via BehaviorSubject
   */
  async fetchPets(filters?: PetFilters, page = 1, limit = 20): Promise<void> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

      const response = await petService.getAll(filters, page, limit);
      
      petStore.setPets(response.pets, response.total, response.page);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar pets');
      petStore.setError(errorMessage);
      console.error('[PetFacade] fetchPets error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  /**
   * Busca um pet específico por ID
   * Atualiza o currentPet no store
   */
  async fetchPetById(id: string): Promise<Pet> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

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

  /**
   * Busca pets de um tutor específico
   */
  async fetchPetsByTutor(cpf: string): Promise<void> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

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

  /**
   * Cria um novo pet
   * Inclui validações e transformações de negócio
   */
  async createPet(data: CreatePetDto): Promise<Pet> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

      // Validações de negócio
      this.validatePetData(data);

      // Transformações (ex: normalizar CPF)
      const normalizedData = this.normalizePetData(data);

      const pet = await petService.create(normalizedData);
      
      // Adiciona à lista local
      petStore.addPet(pet);

      return pet;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao criar pet');
      petStore.setError(errorMessage);
      console.error('[PetFacade] createPet error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  /**
   * Atualiza um pet existente
   */
  async updatePet(id: string, data: Partial<CreatePetDto>): Promise<Pet> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

      // Validações parciais
      if (Object.keys(data).length === 0) {
        throw new Error('Nenhum dado para atualizar');
      }

      const normalizedData = this.normalizePetData(data);

      const pet = await petService.update(id, normalizedData);
      
      // Atualiza na lista local
      petStore.updatePet(pet);

      return pet;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao atualizar pet');
      petStore.setError(errorMessage);
      console.error('[PetFacade] updatePet error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  /**
   * Remove um pet
   */
  async deletePet(id: string): Promise<void> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

      await petService.delete(id);
      
      // Remove da lista local
      petStore.removePet(id);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao remover pet');
      petStore.setError(errorMessage);
      console.error('[PetFacade] deletePet error:', error);
      throw error;
    } finally {
      petStore.setLoading(false);
    }
  }

  /**
   * Define o pet atual (para edição/detalhes)
   */
  setCurrentPet(pet: Pet | null): void {
    petStore.setCurrentPet(pet);
  }

  /**
   * Limpa o estado (útil ao desmontar componentes)
   */
  clear(): void {
    petStore.clear();
  }

  // ========== Métodos de Transformação (Business Logic) ==========

  /**
   * Valida dados do pet antes de enviar à API
   */
  private validatePetData(data: Partial<CreatePetDto>): void {
    if (data.name && data.name.trim().length < 2) {
      throw new Error('Nome do pet deve ter no mínimo 2 caracteres');
    }

    if (data.age !== undefined && (data.age < 0 || data.age > 50)) {
      throw new Error('Idade do pet deve estar entre 0 e 50 anos');
    }

    if (data.weight !== undefined && (data.weight <= 0 || data.weight > 200)) {
      throw new Error('Peso do pet deve estar entre 0 e 200kg');
    }

    if (data.ownerCpf && !this.isValidCpf(data.ownerCpf)) {
      throw new Error('CPF do tutor inválido');
    }
  }

  /**
   * Normaliza dados do pet (transformações)
   */
  private normalizePetData<T extends Partial<CreatePetDto>>(data: T): T {
    return {
      ...data,
      name: data.name?.trim() as T['name'],
      breed: data.breed?.trim() || undefined,
      color: data.color?.trim() || undefined,
      ownerCpf: data.ownerCpf ? this.normalizeCpf(data.ownerCpf) : undefined,
      ownerPhone: data.ownerPhone ? this.normalizePhone(data.ownerPhone) : undefined,
    } as T;
  }

  /**
   * Formata mensagem de erro para exibição ao usuário
   */
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

  /**
   * Valida CPF (algoritmo simplificado)
   */
  private isValidCpf(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11 && /^\d+$/.test(cleaned);
  }

  /**
   * Normaliza CPF (remove formatação)
   */
  private normalizeCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Normaliza telefone (remove formatação)
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Formata idade do pet para exibição (helper para UI)
   * Exemplo: "2 anos", "6 meses"
   */
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

  /**
   * Formata peso do pet para exibição
   */
  formatPetWeight(weightInKg?: number): string {
    if (weightInKg === undefined || weightInKg === null) {
      return 'Peso não informado';
    }

    return `${weightInKg.toFixed(1)} kg`;
  }
}

// Exporta instância singleton do Facade
export const petFacade = new PetFacade();
