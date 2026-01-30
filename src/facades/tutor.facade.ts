import { tutorService } from '../services/tutor.service';
import { tutorStore } from '../state/TutorStore';
import type { Tutor, CreateTutorDto, TutorFilters } from '../types/tutor.types';
import type { Observable } from 'rxjs';
import type { TutorState } from '../state/TutorStore';

/**
 * TutorFacade - Padrão Facade para Tutores
 * 
 * Responsabilidades de Nível Sênior:
 * - Interface única entre UI Components e a camada de dados
 * - Orquestra TutorService + TutorStore
 * - Gerencia loading states e error handling
 * - Transforma dados e aplica lógica de negócio
 * - Expõe observables reativos para a UI
 * - Implementa validações e normalizações
 * 
 * UI Components DEVEM usar APENAS este Facade.
 * NUNCA importar TutorService ou axios diretamente.
 * 
 * Arquitetura:
 * Component → Facade → Service → API
 *                ↓
 *              Store (BehaviorSubject)
 */
export class TutorFacade {
  // ========== Observables Reativos ==========

  /**
   * Observable do estado completo
   */
  getTutorState(): Observable<TutorState> {
    return tutorStore.getTutorState();
  }

  /**
   * Observable da lista de tutores
   * UI subscribe para atualização automática
   */
  get tutores$(): Observable<Tutor[]> {
    return tutorStore.tutores$;
  }

  /**
   * Observable do tutor atual (para detalhes/edição)
   */
  get currentTutor$(): Observable<Tutor | null> {
    return tutorStore.currentTutor$;
  }

  /**
   * Observable do loading state
   */
  get isLoading$(): Observable<boolean> {
    return tutorStore.isLoading$;
  }

  /**
   * Observable do error state
   */
  get error$(): Observable<string | null> {
    return tutorStore.error$;
  }

  /**
   * Observable do total count (para paginação)
   */
  get totalCount$(): Observable<number> {
    return tutorStore.totalCount$;
  }

  // ========== Getters Síncronos (Snapshots) ==========

  /**
   * Retorna lista de tutores atual (snapshot)
   */
  getTutores(): Tutor[] {
    return tutorStore.getTutores();
  }

  /**
   * Retorna tutor atual (snapshot)
   */
  getCurrentTutor(): Tutor | null {
    return tutorStore.getCurrentTutor();
  }

  // ========== Métodos de Negócio ==========

  /**
   * Busca todos os tutores com filtros opcionais
   * 
   * Fluxo:
   * 1. Set loading = true
   * 2. Chama TutorService.getAll()
   * 3. Atualiza TutorStore com resultado
   * 4. Set loading = false
   * 5. Emite para todos os subscribers via BehaviorSubject
   */
  async fetchTutores(filters?: TutorFilters, page = 1, limit = 20): Promise<void> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      const response = await tutorService.getAll(filters, page, limit);
      
      tutorStore.setTutores(response.tutores, response.total, response.page);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar tutores');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] fetchTutores error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  /**
   * Busca um tutor específico por ID
   * Atualiza o currentTutor no store
   */
  async fetchTutorById(id: string): Promise<Tutor> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      const tutor = await tutorService.getById(id);
      
      tutorStore.setCurrentTutor(tutor);
      return tutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar tutor');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] fetchTutorById error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  /**
   * Busca um tutor por CPF
   */
  async fetchTutorByCpf(cpf: string): Promise<Tutor> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      const normalizedCpf = this.normalizeCpf(cpf);
      const tutor = await tutorService.getByCpf(normalizedCpf);
      
      tutorStore.setCurrentTutor(tutor);
      return tutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao buscar tutor por CPF');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] fetchTutorByCpf error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  /**
   * Cria um novo tutor
   * Inclui validações e transformações de negócio
   */
  async createTutor(data: CreateTutorDto): Promise<Tutor> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      // Validações de negócio
      this.validateTutorData(data);

      // Transformações (ex: normalizar CPF, telefone)
      const normalizedData = this.normalizeTutorData(data);

      const tutor = await tutorService.create(normalizedData);
      
      // Adiciona à lista local
      tutorStore.addTutor(tutor);

      return tutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao criar tutor');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] createTutor error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  /**
   * Atualiza um tutor existente
   */
  async updateTutor(id: string, data: Partial<CreateTutorDto>): Promise<Tutor> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      // Validações parciais
      if (Object.keys(data).length === 0) {
        throw new Error('Nenhum dado para atualizar');
      }

      const normalizedData = this.normalizeTutorData(data);

      const tutor = await tutorService.update(id, normalizedData);
      
      // Atualiza na lista local
      tutorStore.updateTutor(tutor);

      return tutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error, 'Erro ao atualizar tutor');
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] updateTutor error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  /**
   * Remove um tutor
   */
  async deleteTutor(id: string): Promise<void> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      await tutorService.delete(id);
      
      // Remove da lista local
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

  /**
   * Ativa/Desativa um tutor
   */
  async toggleTutorActive(id: string, active: boolean): Promise<Tutor> {
    try {
      tutorStore.setLoading(true);
      tutorStore.setError(null);

      const tutor = await tutorService.toggleActive(id, active);
      
      // Atualiza na lista local
      tutorStore.updateTutor(tutor);

      return tutor;
    } catch (error) {
      const errorMessage = this.formatErrorMessage(
        error,
        `Erro ao ${active ? 'ativar' : 'desativar'} tutor`
      );
      tutorStore.setError(errorMessage);
      console.error('[TutorFacade] toggleTutorActive error:', error);
      throw error;
    } finally {
      tutorStore.setLoading(false);
    }
  }

  /**
   * Define o tutor atual (para edição/detalhes)
   */
  setCurrentTutor(tutor: Tutor | null): void {
    tutorStore.setCurrentTutor(tutor);
  }

  /**
   * Limpa o estado (útil ao desmontar componentes)
   */
  clear(): void {
    tutorStore.clear();
  }

  // ========== Métodos de Transformação (Business Logic) ==========

  /**
   * Valida dados do tutor antes de enviar à API
   */
  private validateTutorData(data: Partial<CreateTutorDto>): void {
    if (data.name && data.name.trim().length < 3) {
      throw new Error('Nome do tutor deve ter no mínimo 3 caracteres');
    }

    if (data.cpf && !this.isValidCpf(data.cpf)) {
      throw new Error('CPF inválido');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new Error('Telefone inválido');
    }

    if (data.address?.zipCode && !this.isValidZipCode(data.address.zipCode)) {
      throw new Error('CEP inválido');
    }
  }

  /**
   * Normaliza dados do tutor (transformações)
   */
  private normalizeTutorData<T extends Partial<CreateTutorDto>>(data: T): T {
    return {
      ...data,
      name: data.name?.trim().toUpperCase() as T['name'],
      cpf: data.cpf ? this.normalizeCpf(data.cpf) : undefined,
      email: data.email?.trim().toLowerCase(),
      phone: data.phone ? this.normalizePhone(data.phone) : undefined,
      address: data.address
        ? {
            ...data.address,
            street: data.address.street?.trim(),
            number: data.address.number?.trim(),
            complement: data.address.complement?.trim(),
            neighborhood: data.address.neighborhood?.trim(),
            city: data.address.city?.trim(),
            state: data.address.state?.trim().toUpperCase(),
            zipCode: this.normalizeZipCode(data.address.zipCode),
          }
        : undefined,
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

  // ========== Validações ==========

  /**
   * Valida CPF (algoritmo completo)
   */
  private isValidCpf(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false; // Todos dígitos iguais

    // Valida dígitos verificadores
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

  /**
   * Valida email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida telefone (10 ou 11 dígitos)
   */
  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }

  /**
   * Valida CEP (8 dígitos)
   */
  private isValidZipCode(zipCode: string): boolean {
    const cleaned = zipCode.replace(/\D/g, '');
    return cleaned.length === 8;
  }

  // ========== Normalizações ==========

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
   * Normaliza CEP (remove formatação)
   */
  private normalizeZipCode(zipCode: string): string {
    return zipCode.replace(/\D/g, '');
  }

  // ========== Helpers para UI (Formatações) ==========

  /**
   * Formata CPF para exibição
   * Ex: "12345678900" -> "123.456.789-00"
   */
  formatCpf(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata telefone para exibição
   * Ex: "11987654321" -> "(11) 98765-4321"
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  /**
   * Formata CEP para exibição
   * Ex: "12345678" -> "12345-678"
   */
  formatZipCode(zipCode: string): string {
    const cleaned = zipCode.replace(/\D/g, '');
    if (cleaned.length !== 8) return zipCode;
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Formata endereço completo para exibição
   */
  formatAddress(tutor: Tutor): string {
    if (!tutor.address) return 'Endereço não informado';

    const { street, number, complement, neighborhood, city, state } = tutor.address;
    
    let address = `${street}, ${number}`;
    if (complement) address += ` - ${complement}`;
    address += ` - ${neighborhood}`;
    address += ` - ${city}/${state}`;

    return address;
  }
}

// Exporta instância singleton do Facade
export const tutorFacade = new TutorFacade();
