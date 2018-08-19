import * as React from "react";

export type Key = string;

export type Dictionary<T> = { [key: string]: T };

export type ValueOf<T> = T[keyof T];

export type MapOf<K extends Key, Value> = { [key in K]: Value };

export type EventKeys = "onMount" | "onUpdate" | "onUnmount";

// export interface State {
//   [key: string]: any;
// }

// export type PartialState<S> = { [key in keyof S]?: S[key] };

export type State<API> = Partial<API>;

export interface StateUpdater<S> {
  (state: Readonly<S>): Partial<S>;
}

export interface StateCallback {
  (): void;
}

export interface SetState<S> {
  (
    updaterOrState: StateUpdater<S> | Partial<S>,
    callback?: StateCallback
  ): void;
  <K>(
    updaterOrState: StateUpdater<S> | Partial<S>,
    callback: StateCallback | undefined,
    type: K
  ): void;
}

export interface Action<S, Lol = (...args: any[]) => void> {
  (...args: Lol extends (...args: infer U) => any ? U : any[]):
    | StateUpdater<S>
    | Partial<S>;
}

export interface Selector<S> {
  (...args: any[]): (state: Readonly<S>) => any;
}

export interface EffectArgs<S> {
  state: Readonly<S>;
  setState: SetState<S>;
}

export interface Effect<S> {
  (...args: any[]): (args: EffectArgs<S>) => any;
}

export type ActionMap<State, API> = {
  [actionName: string]: Action<State, ValueOf<API>>;
};

export interface SelectorMap<S> {
  [selectorName: string]: Selector<S>;
}

export interface EffectMap<S> {
  [effectName: string]: Effect<S>;
}

export interface OnMountArgs<S> extends EffectArgs<S> {}

export interface OnMount<S> {
  (args: OnMountArgs<S>): any;
}

export interface OnUpdateArgs<S, K> extends EffectArgs<S> {
  prevState: Readonly<S>;
  type: K;
}

export interface OnUpdate<S, K> {
  (args: OnUpdateArgs<S, K>): any;
}

export interface OnUnmountArgs<S> extends EffectArgs<S> {}

export interface OnUnmount<S> {
  (args: OnUnmountArgs<S>): any;
}

export interface ShouldUpdateArgs<S> {
  state: Readonly<S>;
  nextState: Readonly<S>;
}

export interface ShouldUpdate<S> {
  (args: ShouldUpdateArgs<S>): boolean;
}

export interface ContainerProps<State, API extends State> {
  initialState: State;
  actions?: ActionMap<State, API>;
  selectors?: SelectorMap<State>;
  effects?: SelectorMap<State>;
  context?: string;
  onMount?: OnMount<State>;
  onUpdate?: OnUpdate<State, Exclude<keyof API, keyof State> | EventKeys>;
  onUnmount?: OnUnmount<State>;
  shouldUpdate?: ShouldUpdate<State>;
  children: (api: API) => React.ReactNode;
}
