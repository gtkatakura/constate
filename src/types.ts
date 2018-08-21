import * as React from "react";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Dictionary<T> = { [key: string]: T };

export type ValueOf<T> = T[keyof T];

export type MapOf<K extends string, T> = { [key in K]: T };

export type EventKeys = "onMount" | "onUpdate" | "onUnmount";

export type StateUpdater<S> = (state: Readonly<S>) => Partial<S>;

export type StateCallback = () => void;

export type SetState<S> = (
  updaterOrState: StateUpdater<S> | Partial<S>,
  callback?: () => void
) => void;

/**
 * A React `setState` alternative implementation that receives a `type`
 * argument
 * @template S State
 * @template K Possible values of the `type` argument
 */
export type SetStateWithType<S, K> = (
  updaterOrState: StateUpdater<S> | Partial<S>,
  callback: StateCallback | undefined,
  type: K
) => void;

/**
 * A function passed by `Provider` to `ContextContainer` to be used as a
 * contextual `setState`
 * @template S Global state
 * @template C Context key in the state
 * @template K Possible values of the `type` argument
 */
export type SetContextState<S, C extends keyof S, K> = (
  context: C,
  updaterOrState: StateUpdater<S[C]> | Partial<S[C]>,
  callback?: StateCallback,
  type?: K
) => void;

/**
 * Mount a container on a given context C
 * @template C Possible context values
 */
export interface MountContainer<C> {
  (context: C, onMount?: () => void): (onUnmount?: () => void) => void;
}

/**
 * Action implementation based on public action T
 * @template S State
 * @template T Action to be passed to the children function
 */
export type Action<S, T> = T extends (...args: infer U) => any
  ? (...args: U) => StateUpdater<S> | Partial<S>
  : (...args: unknown[]) => StateUpdater<S> | Partial<S>;

/**
 * Selector implementation based on public selector T
 * @template S State
 * @template T Selector to be passed to the children function
 */
export type Selector<S, T> = T extends (...args: infer U) => infer R
  ? (...args: U) => (state: Readonly<S>) => R
  : (...args: unknown[]) => (state: Readonly<S>) => any;

/**
 * Props received by the effect function implementation
 * @template S State
 */
export interface EffectProps<S> {
  state: Readonly<S>;
  setState: SetState<S>;
}

/**
 * Effect implementation based on public effect T
 * @template S State
 * @template T Effect to be passed to the children function
 */
export type Effect<S, T> = T extends (...args: infer U) => infer R
  ? (...args: U) => (props: EffectProps<S>) => R
  : (...args: unknown[]) => (props: EffectProps<S>) => any;

/**
 * Map of container action implementations
 * @template S State
 * @template P Map of actions to be passed to the children function
 */
export type ActionMap<S, P> = { [K in keyof P]: Action<S, P[K]> };

/**
 * Map of container selector implementations
 * @template S State
 * @template P Map of selectors to be passed to the children function
 */
export type SelectorMap<S, P> = { [K in keyof P]: Selector<S, P[K]> };

/**
 * Map of container effect implementations
 * @template S State
 * @template P Map of effects to be passed to the children function
 */
export type EffectMap<S, P> = { [K in keyof P]: Effect<S, P[K]> };

/**
 * Props received by the `onMount` function prop
 * @template S State
 */
export interface OnMountProps<S> extends EffectProps<S> {}

/**
 * Container `onMount` prop
 * @template S State
 */
export interface OnMount<S> {
  (props: OnMountProps<S>): any;
}

/**
 * Props received by the `onUpdate` function prop
 * @template S State
 * @template K Possible values of the `type` argument
 */
export interface OnUpdateProps<S, K> extends EffectProps<S> {
  prevState: Readonly<S>;
  type: K;
}

/**
 * Container `onUpdate` prop
 * @template S State
 * @template K Possible values of the `type` argument
 */
export interface OnUpdate<S, K> {
  (props: OnUpdateProps<S, K | EventKeys>): any;
}

/**
 * Props received by the `onUnmount` function prop
 * @template S State
 */
export interface OnUnmountProps<S> extends EffectProps<S> {}

/**
 * Container `onUnmount` prop
 * @template S State
 */
export interface OnUnmount<S> {
  (props: OnUnmountProps<S>): any;
}

/**
 * Props received by the `shouldUpdate` function prop
 * @template S State
 */
export interface ShouldUpdateProps<S> {
  state: Readonly<S>;
  nextState: Readonly<S>;
}

/**
 * Container `shouldUpdate` prop
 * @template S State
 */
export interface ShouldUpdate<S> {
  (props: ShouldUpdateProps<S>): boolean;
}

/**
 * `Container` props
 * @template S State
 * @template C Possible values of context
 * @template AP Map of actions to be passed to the children function
 * @template SP Map of selectors to be passed to the children function
 * @template EP Map of effects to be passed to the children function
 */
export interface ContainerProps<S, C, AP = {}, SP = {}, EP = {}> {
  initialState: Partial<S>;
  context?: C;
  actions?: ActionMap<S, AP>;
  selectors?: SelectorMap<S, SP>;
  effects?: EffectMap<S, EP>;
  onMount?: OnMount<S>;
  onUpdate?: OnUpdate<S, keyof AP | keyof EP>;
  onUnmount?: OnUnmount<S>;
  shouldUpdate?: ShouldUpdate<S>;
  children: (props: S & AP & SP & EP) => React.ReactNode;
}

/**
 * Props for composable container components
 * @template S State
 * @template C Possible values of context
 * @template AP Map of actions to be passed to the children function
 * @template SP Map of selectors to be passed to the children function
 * @template EP Map of effects to be passed to the children function
 */
export type ComposableContainerProps<S, C, AP = {}, SP = {}, EP = {}> = Omit<
  ContainerProps<S, C, AP, SP, EP>,
  "actions" | "selectors" | "effects"
>;

/**
 * A composable container is a component that renders `Container` without
 * `children` and receives props
 * @template S State
 * @template C Possible values of context
 * @template AP Map of actions to be passed to the children function
 * @template SP Map of selectors to be passed to the children function
 * @template EP Map of effects to be passed to the children function
 */
export interface ComposableContainer<S, C, AP = {}, SP = {}, EP = {}> {
  (props: ComposableContainerProps<S, C, AP, SP, EP>): JSX.Element;
}
