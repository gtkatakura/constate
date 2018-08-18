import * as React from "react";
import Container from "./Container";

const Lol = () => (
  <Container
    initialState={{ foo: false }}
    actions={{ foo: () => state => ({ foo: state }) }}
  >
    {lol => lol.foo}
  </Container>
);
