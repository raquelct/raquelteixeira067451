import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { Pet } from '../types/pet.types';

/**
 * Estado do gerenciamento de Pets
 */
export interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}

/**
 * Estado inicial
 */
const initialPetState: PetState = {
  pets: [],
  currentPet: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
};

/**
 * PetStore - Gerenciamento Global de Estado de Pets
 * 
 * Features de Nível Sênior:
 * - RxJS BehaviorSubject para estado reativo
 * - Observables granulares (pets$, currentPet$, isLoading$)
 * - Type safety completo
 * - Emissão imediata para todos os subscribers
 * - Singleton pattern
 */
class PetStore {
  private petState$: BehaviorSubject<PetState>;

  constructor() {
    this.petState$ = new BehaviorSubject<PetState>(initialPetState);
  }

  // ========== Observables ==========

  /**
   * Observable do estado completo
   */
  public getPetState(): Observable<PetState> {
    return this.petState$.asObservable();
  }

  /**
   * Observable da lista de pets
   */
  public get pets$(): Observable<Pet[]> {
    return this.petState$.pipe(
      map((state) => state.pets),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do pet atual
   */
  public get currentPet$(): Observable<Pet | null> {
    return this.petState$.pipe(
      map((state) => state.currentPet),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do loading state
   */
  public get isLoading$(): Observable<boolean> {
    return this.petState$.pipe(
      map((state) => state.isLoading),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do error state
   */
  public get error$(): Observable<string | null> {
    return this.petState$.pipe(
      map((state) => state.error),
      distinctUntilChanged()
    );
  }

  /**
   * Observable do total count
   */
  public get totalCount$(): Observable<number> {
    return this.petState$.pipe(
      map((state) => state.totalCount),
      distinctUntilChanged()
    );
  }

  // ========== Getters Síncronos ==========

  /**
   * Retorna snapshot do estado atual
   */
  public getCurrentState(): PetState {
    return this.petState$.getValue();
  }

  /**
   * Retorna lista de pets atual
   */
  public getPets(): Pet[] {
    return this.petState$.getValue().pets;
  }

  /**
   * Retorna pet atual
   */
  public getCurrentPet(): Pet | null {
    return this.petState$.getValue().currentPet;
  }

  // ========== Setters ==========

  /**
   * Define lista de pets
   */
  public setPets(pets: Pet[], totalCount?: number, page?: number): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      pets,
      totalCount: totalCount ?? pets.length,
      currentPage: page ?? currentState.currentPage,
      isLoading: false,
      error: null,
    });
  }

  /**
   * Adiciona um pet à lista
   */
  public addPet(pet: Pet): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      pets: [pet, ...currentState.pets],
      totalCount: currentState.totalCount + 1,
    });
  }

  /**
   * Atualiza um pet na lista
   */
  public updatePet(updatedPet: Pet): void {
    const currentState = this.petState$.getValue();
    const pets = currentState.pets.map((pet) =>
      pet.id === updatedPet.id ? updatedPet : pet
    );
    this.petState$.next({
      ...currentState,
      pets,
      currentPet:
        currentState.currentPet?.id === updatedPet.id
          ? updatedPet
          : currentState.currentPet,
    });
  }

  /**
   * Remove um pet da lista
   */
  public removePet(petId: number): void {
    const currentState = this.petState$.getValue();
    const pets = currentState.pets.filter((pet) => pet.id !== petId);
    this.petState$.next({
      ...currentState,
      pets,
      totalCount: Math.max(0, currentState.totalCount - 1),
      currentPet: currentState.currentPet?.id === petId ? null : currentState.currentPet,
    });
  }

  /**
   * Define o pet atual (para detalhes/edição)
   */
  public setCurrentPet(pet: Pet | null): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      currentPet: pet,
    });
  }

  /**
   * Define loading state
   */
  public setLoading(isLoading: boolean): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      isLoading,
    });
  }

  /**
   * Define error state
   */
  public setError(error: string | null): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      error,
      isLoading: false,
    });
  }

  /**
   * Limpa o estado (reset)
   */
  public clear(): void {
    this.petState$.next(initialPetState);
  }

  /**
   * Cleanup (para testes)
   */
  public destroy(): void {
    this.petState$.complete();
  }
}

// Exporta instância singleton
export const petStore = new PetStore();
