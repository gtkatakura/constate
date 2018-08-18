export type ValueOf<T> = T[keyof T];

export interface State {
  [key: string]: any;
}

export interface StateUpdater<S extends State> {
  (state: S): Partial<S>;
}

export interface SetStateCallback {
  (): void;
}

export interface SetState<S extends State, T extends string> {
  (
    updaterOrState: StateUpdater<S> | Partial<S>,
    callback?: SetStateCallback,
    type?: T
  ): Partial<S>;
}

export interface FunctionArgs<S extends State, T extends string> {
  state: S;
  setState: SetState<S, T>;
}

export interface InitialState extends State {}

export interface Action<S extends State> {
  (...args: any[]): StateUpdater<S> | Partial<S>;
}

export interface ActionMap<S> {
  [actionName: string]: Action<S>;
}

export interface Selector<S extends State> {
  (...args: any[]): (state: S) => any;
}

export interface SelectorMap<S> {
  [selectorName: string]: Selector<S>;
}

export interface Effect<S, T extends string> {
  (...args: any[]): (args: FunctionArgs<S, T>) => void;
}

export interface EffectMap<S, T extends string> {
  [effectName: string]: Effect<S, T>;
}
