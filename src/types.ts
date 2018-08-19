import * as React from "react";

export type Key = string;

export type Dictionary<T> = { [key: string]: T };

export type ValueOf<T> = T[keyof T];

export type MapOf<K extends Key, Value> = { [key in K]: Value };

export type EventKeys = "onMount" | "onUpdate" | "onUnmount";

export interface State {
  [key: string]: any;
}

export type PartialState<S extends State> = { [key in keyof S]?: S[key] };

export interface StateUpdater<S extends State> {
  (state: Readonly<S>): PartialState<S>;
}

export interface SetStateCallback {
  (): void;
}

export interface SetState<S extends State, K extends Key> {
  (
    updaterOrState: StateUpdater<S> | PartialState<S>,
    callback?: SetStateCallback,
    type?: K
  ): void;
}

export interface Action<S extends State> {
  (...args: any[]): StateUpdater<S> | PartialState<S>;
}

export interface Selector<S extends State> {
  (...args: any[]): (state: Readonly<S>) => any;
}

export interface EffectArgs<S extends State, K extends Key> {
  state: Readonly<S>;
  setState: SetState<S, K>;
}

export interface Effect<S, K extends Key> {
  (...args: any[]): (args: EffectArgs<S, K>) => any;
}

export type ActionMap<S, K extends Key> = { [actionName in K]: Action<S> } & {
  [actionName: string]: Action<S>;
};

export type SelectorMap<S, K extends Key> = {
  [selectorName in K]: Selector<S>
} & { [selectorName: string]: Selector<S> };

export type EffectMap<S, K extends Key> = {
  [effectName in K]: Effect<S, K>
} & { [effectName: string]: Effect<S, K> };

export interface OnMountArgs<S, K extends Key> extends EffectArgs<S, K> {}

export interface OnMount<S> {
  (args: OnMountArgs<S, "onMount">): any;
}

export interface OnUpdateArgs<S, K extends Key, KK extends Key>
  extends EffectArgs<S, K> {
  prevState: Readonly<S>;
  type: KK;
}

export interface OnUpdate<S, K extends Key> {
  (args: OnUpdateArgs<S, "onUpdate", K>): any;
}

export interface OnUnmountArgs<S, K extends Key> extends EffectArgs<S, K> {}

export interface OnUnmount<S> {
  (args: OnUnmountArgs<S, "onUnmount">): any;
}

export interface ShouldUpdateArgs<S extends State> {
  state: Readonly<S>;
  nextState: Readonly<S>;
}

export interface ShouldUpdate<S> {
  (args: ShouldUpdateArgs<S>): boolean;
}

export interface ContainerProps<
  S extends State,
  ActionKeys extends Key,
  SelectorKeys extends Key,
  EffectKeys extends Key,
  Keys extends Key
> {
  initialState: S;
  actions?: ActionMap<S, ActionKeys>;
  selectors?: SelectorMap<S, SelectorKeys>;
  effects?: EffectMap<S, EffectKeys>;
  context?: string;
  onMount?: OnMount<S>;
  onUpdate?: OnUpdate<S, Keys | EventKeys>;
  onUnmount?: OnUnmount<S>;
  shouldUpdate?: ShouldUpdate<S>;
  children: (
    props: { [key in keyof S]: S[key] } & { [key in Keys]: Function }
  ) => React.ReactNode;
}
