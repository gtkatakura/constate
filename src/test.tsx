import * as React from "react";
import Container from "./Container";
import { Selector, Action, ActionMap, SelectorMap, Effect } from "./types";

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

const selectors: SelectorMap<State> = {
  bos: ((foo: string) => state => true) as Selector<State>
};

const Lol = () => (
  <Container
    initialState={initialState}
    actions={{ action1, action2 }}
    selectors={selectors}
    effects={{
      cacete: (() => ({ state, setState }) => {}) as Effect<State>
    }}
    onMount={({ state, setState }) => {}}
    onUpdate={({ type, state, prevState, setState }) => {}}
    shouldUpdate={({ state, nextState }) => false}
  >
    {lol => lol}
  </Container>
);
