import { map, distinctUntilChanged } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import type { Tutor } from '../types/tutor.types';
import type { Optional } from '../types/optional';
import { BaseStore, type BaseState } from './BaseStore';

export interface TutorState extends BaseState {
  tutores: Tutor[];
  currentTutor: Optional<Tutor>;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const initialTutorState: TutorState = {
  tutores: [],
  currentTutor: undefined,
  isLoading: false,
  error: undefined,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
};

export class TutorStore extends BaseStore<TutorState> {
  constructor() {
    super(initialTutorState);
  }

  public get tutores$(): Observable<Tutor[]> {
    return this.state$.pipe(
      map((state) => state.tutores),
      distinctUntilChanged()
    );
  }

  public get currentTutor$(): Observable<Optional<Tutor>> {
    return this.state$.pipe(
      map((state) => state.currentTutor),
      distinctUntilChanged()
    );
  }

  public get totalCount$(): Observable<number> {
    return this.state$.pipe(
      map((state) => state.totalCount),
      distinctUntilChanged()
    );
  }

  public setTutores(tutores: Tutor[], total?: number, page?: number, pageSize?: number): void {
    const currentState = this.getCurrentState();
    this.setState({
      tutores,
      totalCount: total ?? tutores.length,
      currentPage: page ?? currentState.currentPage,
      pageSize: pageSize ?? currentState.pageSize,
      isLoading: false,
      error: undefined,
    });
  }

  public addTutor(tutor: Tutor): void {
    const currentState = this.getCurrentState();
    this.setState({
      tutores: [tutor, ...currentState.tutores],
      totalCount: currentState.totalCount + 1,
    });
  }

  public updateTutor(updatedTutor: Tutor): void {
    const currentState = this.getCurrentState();
    const tutores = currentState.tutores.map((tutor) =>
      tutor.id === updatedTutor.id ? updatedTutor : tutor
    );
    this.setState({
      tutores,
      currentTutor:
        currentState.currentTutor?.id === updatedTutor.id
          ? updatedTutor
          : currentState.currentTutor,
    });
  }

  public removeTutor(tutorId: number): void {
    const currentState = this.getCurrentState();
    const tutores = currentState.tutores.filter((tutor) => tutor.id !== tutorId);
    this.setState({
      tutores,
      totalCount: Math.max(0, currentState.totalCount - 1),
      currentTutor: currentState.currentTutor?.id === tutorId ? undefined : currentState.currentTutor,
    });
  }

  public setCurrentTutor(tutor: Optional<Tutor>): void {
    this.setState({
      currentTutor: tutor,
    });
  }
}

export const tutorStore = new TutorStore();
