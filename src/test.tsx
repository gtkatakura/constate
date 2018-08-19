import * as React from "react";
import Container from "./Container";
import { Selector, Action, ActionMap, SelectorMap, Effect } from "./types";

interface State {
  foo: boolean;
  z: boolean | number;
}

interface API extends State {
  action1: (oi: boolean) => void;
}

const initialState: State = {
  foo: false,
  z: 1
};

const action1: Action<State, API["action1"]> = oi => state => ({
  z: oi
});

const Lol = () => (
  <Container<State, API>
    initialState={initialState}
    actions={{ action1 }}
    onMount={({ state, setState }) => {}}
    onUpdate={({ type, state, prevState, setState }) => {}}
    shouldUpdate={({ state, nextState }) => false}
  >
    {lol => lol}
  </Container>
);
