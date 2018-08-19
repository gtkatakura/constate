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

export interface Action<S> {
  (...args: any[]): StateUpdater<S> | Partial<S>;
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

export interface ActionMap<S> {
  [actionName: string]: Action<S>;
}

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

export interface ContainerProps<
  S,
  AM extends ActionMap<S>,
  SM extends SelectorMap<S>,
  EM extends EffectMap<S>
> {
  initialState: S;
  actions?: AM;
  selectors?: SM;
  effects?: EM;
  context?: string;
  onMount?: OnMount<S>;
  onUpdate?: OnUpdate<S, keyof SM>;
  onUnmount?: OnUnmount<S>;
  shouldUpdate?: ShouldUpdate<S>;
  children: (
    props: S &
      {
        [Key in keyof AM]: ValueOf<AM> extends (...args: infer Args) => any
          ? (...args: Args) => void
          : any
      } &
      {
        [Key in keyof SM]: ValueOf<SM> extends (
          ...args: infer Args
        ) => (state: S) => infer R
          ? (...args: Args) => R
          : any
      } &
      {
        [Key in keyof EM]: ValueOf<EM> extends (
          ...args: infer Args
        ) => (...args: any[]) => infer R
          ? (...args: Args) => R
          : any
      }
  ) => React.ReactNode;
}
