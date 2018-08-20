/* eslint-disable react/button-has-type */
import * as React from "react";
import Container from "./Container";
import { SelectorMap, ActionMap, ComposableContainer } from "./types";

interface State {
  count: number;
}

interface Actions {
  increment: (amount?: number) => void;
}

interface Selectors {
  getParity: () => string;
}

const initialState: State = {
  count: 0
};

const actions: ActionMap<State, Actions> = {
  increment: (amount = 1) => state => ({ count: state.count + amount })
};

const selectors: SelectorMap<State, Selectors> = {
  getParity: () => state => (state.count % 2 === 0 ? "even" : "odd")
};

const CounterContainer: ComposableContainer<
  State,
  Actions,
  Selectors
> = props => (
  <Container
    initialState={{ ...initialState, ...props.initialState }}
    actions={actions}
    selectors={selectors}
    {...props}
  />
);

const MyComponent = () => (
  <CounterContainer initialState={{ count: 5 }} onUpdate={({ type }) => {}}>
    {({ count, increment }) => (
      <button onClick={() => increment()}>{count}</button>
    )}
  </CounterContainer>
);
