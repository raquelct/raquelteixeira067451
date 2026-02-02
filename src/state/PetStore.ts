import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { Pet } from '../types/pet.types';
import type { Optional } from '../types/optional';

export interface PetState {
  pets: Pet[];
  currentPet: Optional<Pet>;
  isLoading: boolean;
  error: Optional<string>;
  totalCount: number;
  currentPage: number;
}

const initialPetState: PetState = {
  pets: [],
  currentPet: undefined,
  isLoading: false,
  error: undefined,
  totalCount: 0,
  currentPage: 1,
};

class PetStore {
  private petState$: BehaviorSubject<PetState>;

  constructor() {
    this.petState$ = new BehaviorSubject<PetState>(initialPetState);
  }

  public getPetState(): Observable<PetState> {
    return this.petState$.asObservable();
  }

  public get pets$(): Observable<Pet[]> {
    return this.petState$.pipe(
      map((state) => state.pets),
      distinctUntilChanged()
    );
  }


  public get currentPet$(): Observable<Optional<Pet>> {
    return this.petState$.pipe(
      map((state) => state.currentPet),
      distinctUntilChanged()
    );
  }


  public get isLoading$(): Observable<boolean> {
    return this.petState$.pipe(
      map((state) => state.isLoading),
      distinctUntilChanged()
    );
  }


  public get error$(): Observable<Optional<string>> {
    return this.petState$.pipe(
      map((state) => state.error),
      distinctUntilChanged()
    );
  }


  public get totalCount$(): Observable<number> {
    return this.petState$.pipe(
      map((state) => state.totalCount),
      distinctUntilChanged()
    );
  }

 
  public getCurrentState(): PetState {
    return this.petState$.getValue();
  }


  public getPets(): Pet[] {
    return this.petState$.getValue().pets;
  }

  public getCurrentPet(): Optional<Pet> {
    return this.petState$.getValue().currentPet;
  }

  public setPets(pets: Pet[], totalCount?: number, page?: number): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      pets,
      totalCount: totalCount ?? pets.length,
      currentPage: page ?? currentState.currentPage,
      isLoading: false,
      error: undefined,
    });
  }

  public addPet(pet: Pet): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      pets: [pet, ...currentState.pets],
      totalCount: currentState.totalCount + 1,
    });
  }

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

  public removePet(petId: number): void {
    const currentState = this.petState$.getValue();
    const pets = currentState.pets.filter((pet) => pet.id !== petId);
    this.petState$.next({
      ...currentState,
      pets,
      totalCount: Math.max(0, currentState.totalCount - 1),
      currentPet: currentState.currentPet?.id === petId ? undefined : currentState.currentPet,
    });
  }

  public setCurrentPet(pet: Optional<Pet>): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      currentPet: pet,
    });
  }

  public setLoading(isLoading: boolean): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      isLoading,
    });
  }

  public setError(error: Optional<string>): void {
    const currentState = this.petState$.getValue();
    this.petState$.next({
      ...currentState,
      error,
      isLoading: false,
    });
  }

  public clear(): void {
    this.petState$.next(initialPetState);
  }

  public destroy(): void {
    this.petState$.complete();
  }
}


export const petStore = new PetStore();
