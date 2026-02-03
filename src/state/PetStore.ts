import { map, distinctUntilChanged } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import type { Pet } from '../types/pet.types';
import type { Optional } from '../types/optional';
import { BaseStore, type BaseState } from './BaseStore';

export interface PetState extends BaseState {
  pets: Pet[];
  currentPet: Optional<Pet>;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const initialPetState: PetState = {
  pets: [],
  currentPet: undefined,
  isLoading: false,
  error: undefined,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
};

export class PetStore extends BaseStore<PetState> {
  constructor() {
    super(initialPetState);
  }

  public getPetState(): Observable<PetState> {
    return this.getState();
  }

  public get pets$(): Observable<Pet[]> {
    return this.state$.pipe(
      map((state) => state.pets),
      distinctUntilChanged()
    );
  }

  public get currentPet$(): Observable<Optional<Pet>> {
    return this.state$.pipe(
      map((state) => state.currentPet),
      distinctUntilChanged()
    );
  }

  public get totalCount$(): Observable<number> {
    return this.state$.pipe(
      map((state) => state.totalCount),
      distinctUntilChanged()
    );
  }

  public get pageSize$(): Observable<number> {
    return this.state$.pipe(
      map((state) => state.pageSize),
      distinctUntilChanged()
    );
  }

  public get currentPage$(): Observable<number> {
    return this.state$.pipe(
      map((state) => state.currentPage),
      distinctUntilChanged()
    );
  }

  public getPets(): Pet[] {
    return this.getCurrentState().pets;
  }

  public getCurrentPet(): Optional<Pet> {
    return this.getCurrentState().currentPet;
  }

  public setPets(pets: Pet[], totalCount?: number, page?: number, pageSize?: number): void {
    const currentState = this.getCurrentState();
    this.setState({
      pets,
      totalCount: totalCount ?? pets.length,
      currentPage: page ?? currentState.currentPage,
      pageSize: pageSize ?? currentState.pageSize,
      isLoading: false,
      error: undefined,
    });
  }

  public addPet(pet: Pet): void {
    const currentState = this.getCurrentState();
    this.setState({
      pets: [pet, ...currentState.pets],
      totalCount: currentState.totalCount + 1,
    });
  }

  public updatePet(updatedPet: Pet): void {
    const currentState = this.getCurrentState();
    const pets = currentState.pets.map((pet) =>
      pet.id === updatedPet.id ? updatedPet : pet
    );
    this.setState({
      pets,
      currentPet:
        currentState.currentPet?.id === updatedPet.id
          ? updatedPet
          : currentState.currentPet,
    });
  }

  public removePet(petId: number): void {
    const currentState = this.getCurrentState();
    const pets = currentState.pets.filter((pet) => pet.id !== petId);
    this.setState({
      pets,
      totalCount: Math.max(0, currentState.totalCount - 1),
      currentPet: currentState.currentPet?.id === petId ? undefined : currentState.currentPet,
    });
  }

  public setCurrentPet(pet: Optional<Pet>): void {
    this.setState({
      currentPet: pet,
    });
  }
}

export const petStore = new PetStore();
