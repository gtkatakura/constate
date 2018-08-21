import * as React from "react";
import { StateUpdater, StateCallback } from "./types";

interface ContextState {
  state: {
    [key: string]: any;
  };
  setContextState: <S, K>(
    context: string,
    updaterOrState: StateUpdater<S> | Partial<S>,
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
