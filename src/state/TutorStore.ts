import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { Tutor } from '../types/tutor.types';

/**
 * Estado do gerenciamento de Tutores
 */
export interface TutorState {
  tutores: Tutor[];
  currentTutor: Tutor | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}

/**
 * Estado inicial
 */
const initialTutorState: TutorState = {
  tutores: [],
  currentTutor: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
};

/**
 * TutorStore - Gerenciamento Global de Estado de Tutores
 * 
 * Features de Nível Sênior:
 * - RxJS BehaviorSubject para estado reativo
 * - Observables granulares (tutores$, currentTutor$, isLoading$)
 * - Type safety completo
 * - Emissão imediata para todos os subscribers
 * - Singleton pattern
 */
class TutorStore {
  private tutorState$: BehaviorSubject<TutorState>;

  constructor() {
    this.tutorState$ = new BehaviorSubject<TutorState>(initialTutorState);
  }

  // ========== Observables ==========

  /**
   * Observable do estado completo
   */
  public getTutorState(): Observable<TutorState> {
    return this.tutorState$.asObservable();
  }

  /**
   * Observable da lista de tutores
   */
  public get tutores$(): Observable<Tutor[]> {
    return this.tutorState$.pipe(
      map((state) => state.tutores),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do tutor atual
   */
  public get currentTutor$(): Observable<Tutor | null> {
    return this.tutorState$.pipe(
      map((state) => state.currentTutor),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do loading state
   */
  public get isLoading$(): Observable<boolean> {
    return this.tutorState$.pipe(
      map((state) => state.isLoading),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do error state
   */
  public get error$(): Observable<string | null> {
    return this.tutorState$.pipe(
      map((state) => state.error),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do total count
   */
  public get totalCount$(): Observable<number> {
    return this.tutorState$.pipe(
      map((state) => state.totalCount),
      distinctUntilChanged()
    );
  }

  // ========== Getters Síncronos ==========

  /**
   * Retorna snapshot do estado atual
   */
  public getCurrentState(): TutorState {
    return this.tutorState$.getValue();
  }

  /**
   * Retorna lista de tutores atual
   */
  public getTutores(): Tutor[] {
    return this.tutorState$.getValue().tutores;
  }

  /**
   * Retorna tutor atual
   */
  public getCurrentTutor(): Tutor | null {
    return this.tutorState$.getValue().currentTutor;
  }

  // ========== Setters ==========

  /**
   * Define lista de tutores
   */
  public setTutores(tutores: Tutor[], totalCount?: number, page?: number): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      tutores,
      totalCount: totalCount ?? tutores.length,
      currentPage: page ?? currentState.currentPage,
      isLoading: false,
      error: null,
    });
  }

  /**
   * Adiciona um tutor à lista
   */
  public addTutor(tutor: Tutor): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      tutores: [tutor, ...currentState.tutores],
      totalCount: currentState.totalCount + 1,
    });
  }

  /**
   * Atualiza um tutor na lista
   */
  public updateTutor(updatedTutor: Tutor): void {
    const currentState = this.tutorState$.getValue();
    const tutores = currentState.tutores.map((tutor) =>
      tutor.id === updatedTutor.id ? updatedTutor : tutor
    );
    this.tutorState$.next({
      ...currentState,
      tutores,
      currentTutor:
        currentState.currentTutor?.id === updatedTutor.id
          ? updatedTutor
          : currentState.currentTutor,
    });
  }

  /**
   * Remove um tutor da lista
   */
  public removeTutor(tutorId: string): void {
    const currentState = this.tutorState$.getValue();
    const tutores = currentState.tutores.filter((tutor) => tutor.id !== tutorId);
    this.tutorState$.next({
      ...currentState,
      tutores,
      totalCount: Math.max(0, currentState.totalCount - 1),
      currentTutor:
        currentState.currentTutor?.id === tutorId ? null : currentState.currentTutor,
    });
  }

  /**
   * Define o tutor atual (para detalhes/edição)
   */
  public setCurrentTutor(tutor: Tutor | null): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      currentTutor: tutor,
    });
  }

  /**
   * Define loading state
   */
  public setLoading(isLoading: boolean): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      isLoading,
    });
  }

  /**
   * Define error state
   */
  public setError(error: string | null): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      error,
      isLoading: false,
    });
  }

  /**
   * Limpa o estado (reset)
   */
  public clear(): void {
    this.tutorState$.next(initialTutorState);
  }

  /**
   * Cleanup (para testes)
   */
  public destroy(): void {
    this.tutorState$.complete();
  }
}

// Exporta instância singleton
export const tutorStore = new TutorStore();
