import {
  ActionMap,
  SelectorMap,
  EffectMap,
  SetState,
  StateUpdater,
  State,
  FunctionArgs,
  ValueOf
} from "./types";

type Map<State, T extends string> =
  | ActionMap<State>
  | SelectorMap<State>
  | EffectMap<State, T>;

type Fn<M extends Map<any, any>> = ValueOf<M>;

type MapTransform<M extends Map<any, any>, F extends Fn<M>> = (
  fn: F,
  key: keyof M
) => F;

const mapWith = <M extends Map<any, any>, F extends Fn<M>>(
  map: M,
  transform: MapTransform<M, F>
) =>
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

type ArgumentFn<State, T extends string> = (
  x: any,
  key: T
) => Partial<FunctionArgs<State, T>>;

export const mapArgumentToFunctions = <State, T extends string>(
  argument: typeof fnMap extends SelectorMap<State>
    ? State
    : ArgumentFn<State, T>,
  fnMap: SelectorMap<State> | EffectMap<State, T>
): typeof fnMap =>
  mapWith(fnMap, (fn, key) => (...args: any[]) => {
    const selectOrEffect = fn(...args);
    if (typeof argument === "function") {
      return selectOrEffect(argument(fn, key as T));
    }
    return selectOrEffect(argument);
  });

export const parseUpdater = <S extends State>(
  updaterOrState: StateUpdater<S> | Partial<S>,
  state: S
) =>
  typeof updaterOrState === "function" ? updaterOrState(state) : updaterOrState;
