import {
  ActionMap,
  SelectorMap,
  EffectMap,
  StateUpdater,
  ValueOf,
  EffectArgs,
  Dictionary,
  SetState,
} from "./types";

type APIMap<S> = ActionMap<S> | SelectorMap<S> | EffectMap<S>;

const mapWith = <
  C extends (...args: any[]) => any,
  M extends APIMap<any>,
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

export const mapSetStateToActions = <S>(
  setState: SetState<S>,
  actionMap: ActionMap<S>
) =>
  mapWith(actionMap, (action, key) => (...args) =>
    setState(action(...args), undefined, key)
  );

export const mapStateToSelectors = <S>(
  state: S,
  selectorMap: SelectorMap<S>
) => mapWith(selectorMap, selector => (...args) => selector(...args)(state));

export const mapArgsToEffects = <S>(
  getArgs: (x: any, key: any) => EffectArgs<S>,
  effectMap: EffectMap<S>
) =>
  mapWith(effectMap, (effect, key) => (...args) =>
    effect(...args)(getArgs(undefined, key))
  );

export const parseUpdater = <S>(
  updaterOrState: StateUpdater<S> | Partial<S>,
  state: S
) =>
  typeof updaterOrState === "function" ? updaterOrState(state) : updaterOrState;
