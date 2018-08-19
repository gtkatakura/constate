import * as React from "react";
import Container from "./Container";
import { Selector, Action, ActionMap } from "./types";

interface State {
  foo: boolean;
  z: boolean | number;
}

const initialState: State = {
  foo: false,
  z: 1
};

const action1: Action<State> = (oi: boolean) => ({ z: oi });

const action2: Action<State> = () => state => ({ foo: state.foo, z: 2 });

const Lol = () => (
  <Container
    initialState={initialState}
    actions={{ action1, action2 }}
    context="lol"
    selectors={{
      bos: (foo: string) => state => true
    }}
    effects={{
      cacete: () => ({ state, setState }) => {}
    }}
    onMount={({ state, setState }) => {}}
    onUpdate={({ type, state, prevState, setState }) => {}}
    shouldUpdate={({ state, nextState }) => false}
  >
    {lol => lol.bos()}
  </Container>
);
