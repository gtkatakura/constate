import * as React from "react";
import Container from "./Container";
import { Action, SelectorMap, ActionMap, ContainerProps } from "./types";

type State = {
  foo: boolean;
  z: boolean | number;
};

type Actions = {
  action1: (oi: boolean) => void;
};

type Selectors = {
  selector1: (lala: boolean) => boolean;
};

const initialState: State = {
  foo: false,
  z: 1
};

const action1: Action<State, Actions["action1"]> = oi => state => ({
  z: state.foo
});

const selectors: SelectorMap<State, Selectors> = {
  selector1: lala => state => lala
};

const actions: ActionMap<State, Actions> = { action1 };

const Lol = <S, A, SS, E>(props: ContainerProps<S, A, SS, E>) => (
  <Container<State & S, Actions & A, Selectors & SS, E>
    {...props}
    initialState={Object.assign({}, initialState, props.initialState)}
    actions={{ ...actions, ...(props.actions as object) }}
    selectors={Object.assign({}, selectors, props.selectors)}
  />
);
