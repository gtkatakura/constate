/* eslint-disable react/button-has-type */
import * as React from "react";
import Container from "./Container";
import { SelectorMap, ActionMap, ComposableContainer } from "./types";
import Provider from "./Provider";

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
  <Provider
    initialState={{ lol: { haha: "b" } }}
    onUpdate={props => props.setContextState("cacete", {})}
  >
    <CounterContainer
      initialState={{ count: 5 }}
      onUpdate={({ type }) => {}}
      context="cacete"
    >
      {({ count, increment }) => (
        <button onClick={() => increment(3)}>{count}</button>
      )}
    </CounterContainer>
  </Provider>
);
