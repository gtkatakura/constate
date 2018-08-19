import * as React from "react";
import Container from "./Container";

const Lol = () => (
  <Container
    initialState={{ foo: false, z: 1 }}
    actions={{
      bar: () => state => ({ foo: state.foo }),
      dsadsa: () => state => ({ foo: state.foo, z: 2 })
    }}
    selectors={{
      loler: () => state => true
    }}
    effects={{
      cacete: () => ({ state, setState }) => {}
    }}
    onUpdate={({ type, state, prevState, setState }) => {}}
  >
    {lol => lol}
  </Container>
);
