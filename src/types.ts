import * as React from "react";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Key = string;

export type Dictionary<T> = { [key: string]: T };

export type ValueOf<T> = T[keyof T];

export type MapOf<K extends Key, Value> = { [key in K]: Value };

export type EventKeys = "onMount" | "onUpdate" | "onUnmount";

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

export type Action<S, T> = T extends (...args: infer U) => any
  ? (...args: U) => StateUpdater<S> | Partial<S>
  : any;

export type Selector<S, T> = T extends (...args: infer U) => infer R
  ? (...args: U) => (state: Readonly<S>) => R
  : any;

export interface EffectProps<S> {
  state: Readonly<S>;
  setState: SetState<S>;
}

export type Effect<S, T> = T extends (...args: infer U) => infer R
  ? (...args: U) => (props: EffectProps<S>) => R
  : any;

export type ActionMap<S, P> = { [K in keyof P]: Action<S, P[K]> };

export type SelectorMap<S, P> = { [K in keyof P]: Selector<S, P[K]> };

export type EffectMap<S, P> = { [K in keyof P]: Effect<S, P[K]> };

export interface OnMountProps<S> extends EffectProps<S> {}

export interface OnMount<S> {
  (props: OnMountProps<S>): any;
}

export interface OnUpdateProps<S, K> extends EffectProps<S> {
  prevState: Readonly<S>;
  type: K;
}

export interface OnUpdate<S, K> {
  (props: OnUpdateProps<S, K | EventKeys>): any;
}

export interface OnUnmountProps<S> extends EffectProps<S> {}

export interface OnUnmount<S> {
  (props: OnUnmountProps<S>): any;
}

export interface ShouldUpdateProps<S> {
  state: Readonly<S>;
  nextState: Readonly<S>;
}

export interface ShouldUpdate<S> {
  (props: ShouldUpdateProps<S>): boolean;
}

export interface ContainerProps<
  State,
  Actions,
  Selectors,
  Effects,
  API = State & Actions & Selectors & Effects
> {
  initialState: State;
  actions?: ActionMap<State, Actions>;
  selectors?: SelectorMap<State, Selectors>;
  effects?: SelectorMap<State, Effects>;
  context?: string;
  onMount?: OnMount<State>;
  onUpdate?: OnUpdate<State, keyof Actions | keyof Effects>;
  onUnmount?: OnUnmount<State>;
  shouldUpdate?: ShouldUpdate<State>;
  children: (props: API) => React.ReactNode;
}
