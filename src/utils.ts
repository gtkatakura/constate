import {
  ActionMap,
  SelectorMap,
  EffectMap,
  StateUpdater,
  ValueOf,
  EffectProps,
  Dictionary,
  SetState
} from "./types";

type APIMap<S, P> = ActionMap<S, P> | SelectorMap<S, P> | EffectMap<S, P>;

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

export const mapSetStateToActions = <S, P>(
  setState: SetState<S>,
  actionMap: ActionMap<S, P>
) =>
  mapWith(actionMap, (action, key) => (...args) =>
    setState(action(...args), undefined, key)
  );

export const mapStateToSelectors = <S, P>(
  state: S,
  selectorMap: SelectorMap<S, P>
) => mapWith(selectorMap, selector => (...args) => selector(...args)(state));

export const mapArgsToEffects = <S, P>(
  getArgs: (x: any, key: any) => EffectProps<S>,
  effectMap: EffectMap<S, P>
) =>
  mapWith(effectMap, (effect, key) => (...args) =>
    effect(...args)(getArgs(undefined, key))
  );

export const parseUpdater = <S>(
  updaterOrState: StateUpdater<S> | Partial<S>,
  state: S
) =>
  typeof updaterOrState === "function" ? updaterOrState(state) : updaterOrState;
