import * as React from "react";

export interface ContextValue {
  state: {};
}

const Context = React.createContext<ContextValue>({ state: {} });

export default Context;
