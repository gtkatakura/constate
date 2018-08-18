import * as React from "react";
import Consumer from "./Consumer";
import ContextContainer from "./ContextContainer";
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
  MapOf
} from "./types";

interface ContainerProps<
  S extends State,
  AK extends Key,
  SK extends Key,
  EK extends Key,
  K extends Key = AK | SK | EK | "onMount" | "onUpdate" | "onUnmount"
> {
  initialState: S;
  actions?: ActionMap<S, AK>;
  selectors?: SelectorMap<S, SK>;
  effects?: EffectMap<S, EK>;
  context?: string;
  onMount?: OnMount<S>;
  onUpdate?: OnUpdate<S, K>;
  onUnmount?: OnUnmount<S>;
  shouldUpdate?: ShouldUpdate<S>;
  children: (
    props:
      | S
      | MapOf<AK, ActionMap<S, AK>[AK]>
      | MapOf<SK, SelectorMap<S, SK>[SK]>
      | MapOf<EK, EffectMap<S, EK>[EK]>
  ) => React.ReactNode;
}

class Container<
  S,
  AK extends Key,
  SK extends Key,
  EK extends Key,
  K extends Key
> extends React.Component<ContainerProps<S, AK, SK, EK, K>, S> {
  static defaultProps = {
    initialState: {}
  };

  state = this.props.initialState;

  ignoreState = null;

  componentDidMount() {
    const { context, onMount } = this.props;
    if (!context && onMount) {
      onMount(this.getArgs({}, "onMount"));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
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

  getArgs = (additionalArgs, type) => ({
    state: this.state,
    setState: (u, c) => this.handleSetState(u, c, type),
    ...additionalArgs
  });

  handleSetState = (updater, callback, type) => {
    let prevState;

    this.setState(
      state => {
        prevState = state;
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
    if (this.props.context) {
      return (
        <Consumer>
          {props => <ContextContainer {...props} {...this.props} />}
        </Consumer>
      );
    }

    const { children, actions, selectors, effects } = this.props;

    return children({
      ...this.state,
      ...(actions && mapSetStateToActions(this.handleSetState, actions)),
      ...(selectors && mapStateToSelectors(this.state, selectors)),
      ...(effects && mapArgsToEffects(this.getArgs, effects))
    });
  }
}

export default Container;
