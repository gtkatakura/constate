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
  Key,
  PartialState
} from "./types";

type APIMap<State, K extends Key> =
  | ActionMap<State, K>
  | SelectorMap<State, K>
  | EffectMap<State, K>;

const mapWith = <
  C extends (...args: any[]) => any,
  M extends APIMap<any, any>,
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

export const mapSetStateToActions = <State, K extends Key>(
  setState: SetState<State, K>,
  actionMap: ActionMap<State, K>
) =>
  mapWith(actionMap, (action, key) => (...args) =>
    setState(action(...args), undefined, key as K)
  );

export const mapStateToSelectors = <S extends State, K extends Key>(
  state: S,
  selectorMap: SelectorMap<S, K>
) => mapWith(selectorMap, selector => (...args) => selector(...args)(state));

export const mapArgsToEffects = <State, K extends Key>(
  getArgs: (x: any, key: K) => EffectArgs<State, K>,
  effectMap: EffectMap<State, K>
) =>
  mapWith(effectMap, (effect, key) => (...args) =>
    effect(...args)(getArgs(undefined, key as K))
  );

export const parseUpdater = <S extends State>(
  updaterOrState: StateUpdater<S> | PartialState<S>,
  state: S
) =>
  typeof updaterOrState === "function" ? updaterOrState(state) : updaterOrState;
