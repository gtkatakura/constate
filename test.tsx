/* eslint-disable */
import * as React from "react";
import { ActionMap, Container, ComposableContainer } from ".";

interface State {
  count: number;
}

interface Actions {
  increment: (amount?: number) => void;
}

const initialState: State = {
  count: 0
};

const actions: ActionMap<State, Actions> = {
  increment: (amount = 1) => state => ({ count: state.count + amount })
};

const CounterContainer: ComposableContainer<State, Actions> = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    actions={actions}
  />
);

const Counter = () => (
  <CounterContainer>
    {({ increment }) => <button onClick={() => increment()} />}
  </CounterContainer>
);
