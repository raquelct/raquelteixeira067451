import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { Optional } from '../types/optional';

export interface BaseState {
  isLoading: boolean;
  error: Optional<string>;
}

export abstract class BaseStore<T extends BaseState> {
  protected state$: BehaviorSubject<T>;
  protected initialState: T;

  constructor(initialState: T) {
    this.initialState = initialState;
    this.state$ = new BehaviorSubject<T>(initialState);
  }

  public getState(): Observable<T> {
    return this.state$.asObservable();
  }

  public get isLoading$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.isLoading),
      distinctUntilChanged()
    );
  }

  public get error$(): Observable<Optional<string>> {
    return this.state$.pipe(
      map((state) => state.error),
      distinctUntilChanged()
    );
  }

  public getCurrentState(): T {
    return this.state$.getValue();
  }

  public setLoading(isLoading: boolean): void {
    const currentState = this.getCurrentState();
    this.state$.next({
      ...currentState,
      isLoading,
    });
  }

  public setError(error: Optional<string>): void {
    const currentState = this.getCurrentState();
    this.state$.next({
      ...currentState,
      error,
      isLoading: false,
    });
  }

  public clear(): void {
    this.state$.next(this.initialState);
  }

  public destroy(): void {
    this.state$.complete();
  }

  protected setState(newState: Partial<T>): void {
    const currentState = this.getCurrentState();
    this.state$.next({
      ...currentState,
      ...newState,
    });
  }
}
