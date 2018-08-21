import * as React from "react";
import { StateUpdater, StateCallback } from "./types";

interface ContextState {
  state: {};
  setContextState: <S, C extends keyof S, K>(
    context: C,
    updaterOrState: StateUpdater<S[C]> | Partial<S[C]>,
    callback?: StateCallback,
    type?: K
  ) => void;
  mountContainer: <C>(
    context: C,
    onMount?: () => void
  ) => (onUnmount?: () => void) => void;
}

const Context = React.createContext({} as ContextState);

export default Context;
