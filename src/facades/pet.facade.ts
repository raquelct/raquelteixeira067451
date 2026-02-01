import { petService } from '../services/pet.service';
import { petStore } from '../state/PetStore';
import type { Pet, CreatePetDto, PetFormData, PetFilters } from '../types/pet.types';
import type { Observable } from 'rxjs';
import type { PetState } from '../state/PetStore';
import { toast } from 'react-hot-toast';


export class PetFacade {
  // ========== Controle de Estado Interno ==========
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

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
   * - Previne requisições duplicadas com request deduplication
   * - Gerencia loading state automaticamente
   * - Error handling com mensagens user-friendly
   * 
   * Fluxo:
   * 1. Verifica se requisição já está em andamento
   * 2. Set loading = true
   * 3. Chama PetService.getAll()
   * 4. Atualiza PetStore com resultado
   * 5. Set loading = false
   * 6. Emite para todos os subscribers via BehaviorSubject
   * 
   * @param filters - Filtros opcionais (nome, espécie, etc)
   * @param page - Número da página (default: 1)
   * @param size - Quantidade de itens por página (default: 10 conforme edital)
   */
  async fetchPets(filters?: PetFilters, page = 1, size = 10): Promise<void> {
    // Cria chave única para deduplicação
    const requestKey = `fetchPets-${JSON.stringify(filters)}-${page}-${size}`;

    // Se já existe requisição em andamento, retorna a Promise existente
    if (this.pendingRequests.has(requestKey)) {
      console.log('[PetFacade] Requisição duplicada detectada, aguardando existente...');
      return this.pendingRequests.get(requestKey) as Promise<void>;
    }

    // Cria nova Promise e armazena
    const requestPromise = (async () => {
      try {
        petStore.setLoading(true);
        petStore.setError(null);

        const response = await petService.getAll(filters, page, size);

        // API retorna 'content' em vez de 'pets'
        petStore.setPets(response.content, response.total, response.page);
      } catch (error) {
        const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar pets');
        petStore.setError(errorMessage);
        console.error('[PetFacade] fetchPets error:', error);
        throw error;
      } finally {
        petStore.setLoading(false);
        // Remove da lista de pendentes ao finalizar
        this.pendingRequests.delete(requestKey);
      }
    })();

    // Armazena a Promise
    this.pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  /**
   * Busca um pet específico por ID
   * Atualiza o currentPet no store
   */
  async fetchPetById(id: number): Promise<Pet> {
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
   * Cria um novo pet com upload de foto opcional
   * 
   * Fluxo Sequential (Create-then-Upload):
   * 1. Valida e normaliza dados
   * 2. Cria o pet (POST /v1/pets) - obtém o ID
   * 3. Se há imagem: faz upload usando o ID (POST /v1/pets/:id/fotos)
   * 4. Atualiza lista (fetchPets)
   * 
   * @param data - Dados do formulário (nome, raca, idade)
   * @param imageFile - Arquivo de imagem opcional
   * @returns Pet criado
   */
  async createPet(data: PetFormData, imageFile?: File): Promise<Pet> {
    let createdPet: Pet | null = null;

    try {
      petStore.setLoading(true);
      petStore.setError(null);

      // 1. Prepara dados para criação (apenas campos válidos)
      const createData: CreatePetDto = {
        nome: data.nome,
        raca: data.raca,
        idade: data.idade,
      };

      // 2. Validações de negócio
      this.validatePetData(createData);

      // 3. Transformações (normalização)
      const normalizedData = this.normalizePetData(createData);

      // 4. PRIMEIRO: Cria o pet (obtém ID)
      createdPet = await petService.create(normalizedData);

      // 5. DEPOIS: Upload da foto (se fornecida)
      if (imageFile && createdPet.id) {
        try {
          await petService.uploadPhoto(createdPet.id, imageFile);
        } catch (uploadError) {
          console.error('[PetFacade] Erro no upload da foto:', uploadError);
          // Pet já foi criado, então apenas avisamos sobre a falha do upload (logs)
          // Toast de erro será exibido pelo Interceptor Global se for erro de API
        }
      }

      // 6. Atualiza a lista (refresh)
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

  /**
   * Atualiza um pet existente
   */
  /**
   * Atualiza pet existente (sequencial: Delete Photo se necessário → Update → Upload Photo se necessário)
   */
  async updatePet(id: number, data: PetFormData, imageFile?: File, isImageRemoved?: boolean, currentPhotoId?: number): Promise<Pet> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

      this.validatePetData(data);

      // 1. Verificar se precisa deletar a foto atual
      if (isImageRemoved && currentPhotoId) {
        try {
          console.log(`[PetFacade] Removendo foto ${currentPhotoId} do pet ${id}...`);
          await petService.deletePhoto(id, currentPhotoId);
          console.log('[PetFacade] Foto removida com sucesso');
        } catch (deleteError) {
          console.warn('[PetFacade] Falha ao remover foto (pode já ter sido removida):', deleteError);
          // Não lançamos erro aqui para permitir que a atualização do texto continue (Fail Safe)
        }
      }

      const normalizedData = this.normalizePetData(data);

      // 2. Atualizar dados do pet
      const updatedPet = await petService.update(id, normalizedData);

      // 3. Se houver NOVA imagem, fazer upload
      if (imageFile) {
        try {
          await petService.uploadPhoto(Number(updatedPet.id), imageFile);
        } catch (uploadError) {
          console.warn('[PetFacade] Falha no upload da foto:', uploadError);
          // Toast manipulado pelo Interceptor
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

  /**
   * Remove um pet
   */
  async deletePet(id: number): Promise<void> {
    try {
      petStore.setLoading(true);
      petStore.setError(null);

      await petService.delete(id);

      // Remove da lista local
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
   * Apenas campos suportados: nome, raca, idade
   */
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

  /**
   * Normaliza dados do pet (transformações)
   * Apenas campos suportados: nome, raca, idade
   */
  private normalizePetData<T extends Partial<CreatePetDto>>(data: T): T {
    return {
      ...data,
      nome: data.nome?.trim() as T['nome'],
      raca: data.raca?.trim() as T['raca'],
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
