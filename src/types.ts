export type Key = string;

export type Dictionary<T> = { [key: string]: T };

export type ValueOf<T> = T[keyof T];

export type MapOf<K extends Key, Value> = { [key in K]: Value };

export interface State {
  [key: string]: any;
}

export interface StateUpdater<S extends State> {
  (state: Readonly<S>): { [key in keyof S]?: any };
}

export interface SetStateCallback {
  (): void;
}

export interface SetState<S extends State, K extends Key> {
  (
    updaterOrState: StateUpdater<S> | { [key in keyof S]?: any },
    callback: SetStateCallback | undefined,
    type: K
  ): void;
}

export interface Action<S extends State> {
  (...args: any[]): StateUpdater<S> | Pick<S, keyof S>;
}

export interface Selector<S extends State> {
  (...args: any[]): (state: Readonly<S>) => any;
}

export interface EffectArgs<S extends State, K extends Key> {
  state: Readonly<S>;
  setState: SetState<S, K>;
}

export interface Effect<S, K extends Key> {
  (...args: any[]): (args: EffectArgs<S, K>) => Promise<any> | void;
}

export type ActionMap<S, K extends Key> = { [actionName in K]: Action<S> };

export type SelectorMap<S, K extends Key> = {
  [selectorName in K]: Selector<S>
};

export type EffectMap<S, K extends Key> = { [effectName in K]: Effect<S, K> };

export interface OnMountArgs<S, K extends Key> extends EffectArgs<S, K> {}

export interface OnMount<S> {
  (args: OnMountArgs<S, "onMount">): Promise<any> | void;
}

export interface OnUpdateArgs<S, K extends Key, KK extends Key>
  extends EffectArgs<S, K> {
  prevState: Readonly<S>;
  type: KK;
}

export interface OnUpdate<S, K extends Key> {
  (args: OnUpdateArgs<S, "onUpdate", K>): Promise<any> | void;
}

export interface OnUnmountArgs<S, K extends Key> extends EffectArgs<S, K> {}

export interface OnUnmount<S> {
  (args: OnUnmountArgs<S, "onUnmount">): Promise<any> | void;
}

export interface ShouldUpdateArgs<S extends State> {
  state: Readonly<S>;
  nextState: Readonly<S>;
}

export interface ShouldUpdate<S> {
  (args: ShouldUpdateArgs<S>): boolean;
}
