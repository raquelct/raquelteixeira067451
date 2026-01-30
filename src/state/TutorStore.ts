import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { Tutor } from '../types/tutor.types';

/**
 * Estado global dos tutores
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
  currentPage: 0,
};

/**
 * TutorStore - Gerenciamento de estado global para Tutores
 */
class TutorStore {
  private tutorState$ = new BehaviorSubject<TutorState>(initialTutorState);

  tutores$ = this.tutorState$.pipe(
    map((state) => state.tutores),
    distinctUntilChanged()
  );

  currentTutor$ = this.tutorState$.pipe(
    map((state) => state.currentTutor),
    distinctUntilChanged()
  );

  isLoading$ = this.tutorState$.pipe(
    map((state) => state.isLoading),
    distinctUntilChanged()
  );

  error$ = this.tutorState$.pipe(
    map((state) => state.error),
    distinctUntilChanged()
  );

  totalCount$ = this.tutorState$.pipe(
    map((state) => state.totalCount),
    distinctUntilChanged()
  );

  setTutores(tutores: Tutor[], total?: number, page?: number): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      tutores,
      totalCount: total ?? tutores.length,
      currentPage: page ?? currentState.currentPage,
    });
  }

  addTutor(tutor: Tutor): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      tutores: [tutor, ...currentState.tutores],
      totalCount: currentState.totalCount + 1,
    });
  }

  updateTutor(updatedTutor: Tutor): void {
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

  removeTutor(tutorId: number): void {
    const currentState = this.tutorState$.getValue();
    const tutores = currentState.tutores.filter((tutor) => tutor.id !== tutorId);
    
    this.tutorState$.next({
      ...currentState,
      tutores,
      totalCount: Math.max(0, currentState.totalCount - 1),
      currentTutor: currentState.currentTutor?.id === tutorId ? null : currentState.currentTutor,
    });
  }

  setCurrentTutor(tutor: Tutor | null): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      currentTutor: tutor,
    });
  }

  setLoading(isLoading: boolean): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      isLoading,
    });
  }

  setError(error: string | null): void {
    const currentState = this.tutorState$.getValue();
    this.tutorState$.next({
      ...currentState,
      error,
    });
  }

  clear(): void {
    this.tutorState$.next(initialTutorState);
  }

  getCurrentState(): TutorState {
    return this.tutorState$.getValue();
  }
}

export const tutorStore = new TutorStore();
