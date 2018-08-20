import * as React from "react";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Dictionary<T> = { [key: string]: T };

export type ValueOf<T> = T[keyof T];

export type MapOf<K extends string, T> = { [key in K]: T };

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
  : (...args: unknown[]) => StateUpdater<S> | Partial<S>;

export type Selector<S, T> = T extends (...args: infer U) => infer R
  ? (...args: U) => (state: Readonly<S>) => R
  : (...args: unknown[]) => (state: Readonly<S>) => any;

export interface EffectProps<S> {
  state: Readonly<S>;
  setState: SetState<S>;
}

export type Effect<S, T> = T extends (...args: infer U) => infer R
  ? (...args: U) => (props: EffectProps<S>) => R
  : (...args: unknown[]) => (props: EffectProps<S>) => any;

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

export interface ContainerProps<S, AP = {}, SP = {}, EP = {}> {
  initialState?: Partial<S>;
  actions?: ActionMap<S, AP>;
  selectors?: SelectorMap<S, SP>;
  effects?: SelectorMap<S, EP>;
  context?: string;
  onMount?: OnMount<S>;
  onUpdate?: OnUpdate<S, keyof AP | keyof EP>;
  onUnmount?: OnUnmount<S>;
  shouldUpdate?: ShouldUpdate<S>;
  children: (props: S & AP & SP & EP) => React.ReactNode;
}

export type ComposableContainerProps<S, AP = {}, SP = {}, EP = {}> = Omit<
  ContainerProps<S, AP, SP, EP>,
  "actions" | "selectors" | "effects"
>;

export interface ComposableContainer<S, AP = {}, SP = {}, EP = {}> {
  (props: ComposableContainerProps<S, AP, SP, EP>): JSX.Element;
}
