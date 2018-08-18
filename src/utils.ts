import {
  ActionMap,
  SelectorMap,
  EffectMap,
  SetState,
  StateUpdater,
  State,
  ValueOf,
  EffectArgs,
  Dictionary,
  ChildrenFunction
} from "./types";

type Map<State, T extends string> =
  | ActionMap<State>
  | SelectorMap<State>
  | EffectMap<State, T>;

const mapWith = <
  C extends ChildrenFunction,
  M extends Map<any, any>,
  F extends ValueOf<M>
>(
  map: M,
  transform: (fn: F, key: keyof M) => C
): Dictionary<C> =>
  Object.keys(map).reduce(
    (final, key) => ({
      ...final,
      [key]: transform(map[key] as F, key)
    }),
    {}
  );

export const mapSetStateToActions = <State, T extends string>(
  setState: SetState<State, T>,
  actionMap: ActionMap<State>
) =>
  mapWith(actionMap, (action, key) => (...args) =>
    setState(action(...args), undefined, key as T)
  );

export const mapStateToSelectors = <S extends State>(
  state: S,
  selectorMap: SelectorMap<S>
) => mapWith(selectorMap, selector => (...args) => selector(...args)(state));

export const mapArgsToEffects = <State, T extends string>(
  getArgs: (x: any, key: T) => EffectArgs<State, T>,
  effectMap: EffectMap<State, T>
) =>
  mapWith(effectMap, (effect, key) => (...args) =>
    effect(...args)(getArgs(undefined, key as T))
  );

export const parseUpdater = <S extends State>(
  updaterOrState: StateUpdater<S> | Partial<S>,
  state: S
) =>
  typeof updaterOrState === "function" ? updaterOrState(state) : updaterOrState;
