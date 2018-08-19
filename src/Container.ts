import * as React from "react";
// import Consumer from "./Consumer";
// import ContextContainer from "./ContextContainer";
import {
  mapSetStateToActions,
  mapStateToSelectors,
  mapArgsToEffects,
  parseUpdater
} from "./utils";
import {
  ActionMap,
  State,
  SelectorMap,
  EffectMap,
  OnMount,
  OnUpdate,
  OnUnmount,
  ShouldUpdate,
  Key,
  SetState,
  EffectArgs
} from "./types";

interface ContainerProps<
  S extends State,
  AK extends Key,
  SK extends Key,
  EK extends Key,
  K extends Key
> {
  initialState: S;
  actions?: ActionMap<S, AK>;
  selectors?: SelectorMap<S, SK>;
  effects?: EffectMap<S, EK>;
  context?: string;
  onMount?: OnMount<S>;
  onUpdate?: OnUpdate<S, K | "onMount" | "onUpdate" | "onUnmount">;
  onUnmount?: OnUnmount<S>;
  shouldUpdate?: ShouldUpdate<S>;
  children: (
    props: { [key in keyof S]: S[key] } & { [key in K]: Function }
  ) => React.ReactNode;
}

class Container<
  S extends State,
  AK extends Key,
  SK extends Key,
  EK extends Key,
  K extends Key = AK | SK | EK
> extends React.Component<ContainerProps<S, AK, SK, EK, K>> {
  static defaultProps = {
    initialState: {}
  };

  state: S = this.props.initialState;

  ignoreState: S | boolean | null = null;

  componentDidMount() {
    const { context, onMount } = this.props;
    if (!context && onMount) {
      onMount(this.getArgs({}, "onMount"));
    }
  }

  shouldComponentUpdate(
    nextProps: ContainerProps<S, AK, SK, EK, K>,
    nextState: S
  ) {
    const { context, shouldUpdate } = this.props;
    if (!context && shouldUpdate) {
      const couldUpdate = shouldUpdate({ state: this.state, nextState });
      this.ignoreState = !couldUpdate && nextState;
      return couldUpdate;
    }
    return true;
  }

  componentWillUnmount() {
    const { context, onUnmount } = this.props;
    if (!context && onUnmount) {
      onUnmount(this.getArgs({ setState: () => {} }));
    }
  }

  getArgs = (
    additionalArgs: object | undefined,
    type?: AK | SK | EK | "onMount" | "onUpdate" | "onUnmount"
  ): EffectArgs<S, AK | SK | EK | "onMount" | "onUpdate" | "onUnmount"> => ({
    state: this.state,
    setState: (u, c) => this.handleSetState(u, c, type),
    ...additionalArgs
  });

  handleSetState: SetState<
    S,
    AK | SK | EK | "onMount" | "onUpdate" | "onUnmount"
  > = (updater, callback, type) => {
    let prevState: { -readonly [key in keyof S]: S[key] };

    this.setState(
      state => {
        prevState = state as typeof prevState;
        return parseUpdater(updater, state);
      },
      () => {
        if (this.props.onUpdate && this.ignoreState !== this.state) {
          this.props.onUpdate(this.getArgs({ prevState, type }, "onUpdate"));
        }
        if (callback) callback();
      }
    );
  };

  render() {
    // if (this.props.context) {
    //   return (
    //     <Consumer>
    //       {props => <ContextContainer {...props} {...this.props} />}
    //     </Consumer>
    //   );
    // }

    const { children, actions, selectors, effects } = this.props;

    return children(
      Object.assign(
        {},
        this.state,
        actions && mapSetStateToActions<S, AK>(this.handleSetState, actions),
        selectors && mapStateToSelectors<S, SK>(this.state, selectors),
        effects && mapArgsToEffects<S, EK>(this.getArgs, effects)
      )
    );
  }
}

export default Container;
