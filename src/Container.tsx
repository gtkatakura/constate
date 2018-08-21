import * as React from "react";
import Consumer from "./Consumer";
import {
  mapSetStateToActions,
  mapStateToSelectors,
  parseUpdater,
  mapPropsToEffects
} from "./utils";
import {
  ContainerProps,
  EventKeys,
  EffectProps,
  SetStateWithType,
  StateUpdater
} from "./types";

class Container<
  State,
  Actions = {},
  Selectors = {},
  Effects = {}
> extends React.Component<
  ContainerProps<State, Actions, Selectors, Effects>,
  State
> {
  static defaultProps = {
    initialState: {}
  };

  readonly state = this.props.initialState as State;

  private ignoreState: State | boolean = false;

  private unmount?: (onUnmount: () => void) => void = undefined;

  constructor(props: ContainerProps<State, Actions, Selectors, Effects>) {
    super(props);
    const { state, setState, initialState } = props;
    if (setState && !state) {
      setState(
        currentState => Object.assign({}, initialState, currentState),
        undefined,
        "initialState"
      );
    }
  }

  componentDidMount() {
    const { mountContainer, onMount, context } = this.props;
    const mount = () => onMount && onMount(this.getEffectProps("onMount"));

    if (mountContainer) {
      this.unmount = mountContainer(mount);
    } else if (!context) {
      mount();
    }
  }

  shouldComponentUpdate(
    nextProps: ContainerProps<State, Actions, Selectors, Effects>,
    nextState: State
  ) {
    const { state: stateFromProps } = this.props;
    const { state: nextStateFromProps, shouldUpdate, context } = nextProps;
    let couldUpdate = true;

    if (stateFromProps && nextStateFromProps && shouldUpdate) {
      couldUpdate = shouldUpdate({
        state: stateFromProps,
        nextState: nextStateFromProps
      });
      this.ignoreState = !couldUpdate && nextStateFromProps;
    } else if (!context && shouldUpdate) {
      couldUpdate = shouldUpdate({ state: this.state, nextState });
      this.ignoreState = !couldUpdate && nextState;
    }

    return couldUpdate;
  }

  componentWillUnmount() {
    const { context, onUnmount } = this.props;
    const unmount = () =>
      onUnmount && onUnmount(this.getEffectProps("onUnmount"));

    if (this.unmount) {
      this.unmount(unmount);
    } else if (!context) {
      unmount();
    }
  }

  getEffectProps = (
    type: keyof Actions | keyof Effects | EventKeys
  ): EffectProps<State> => ({
    state: this.props.state || this.state,
    setState: (u, c) => this.handleSetState(u, c, type)
  });

  handleSetState: SetStateWithType<
    State,
    keyof Actions | keyof Effects | EventKeys
  > = (updater, callback, type) => {
    let prevState: State;

    const updaterFn: StateUpdater<State> = state => {
      prevState = state;
      return parseUpdater(updater, state);
    };

    const callbackFn = () => {
      const { state = this.state, onUpdate } = this.props;
      if (onUpdate && this.ignoreState !== state) {
        onUpdate({
          ...this.getEffectProps("onUpdate"),
          prevState,
          type
        });
      }

      if (callback) callback();
    };

    if (this.props.setState) {
      this.props.setState(updaterFn, callbackFn, type);
    } else {
      // @ts-ignore
      this.setState(updaterFn, callbackFn);
    }
  };

  render() {
    const { context, ...props } = this.props;

    if (typeof context !== "undefined") {
      return (
        <Consumer>
          {({ state, setContextState, mountContainer }) => (
            <Container
              {...props}
              state={state[context]}
              setState={(...args) => setContextState(context, ...args)}
              mountContainer={(...args) => mountContainer(context, ...args)}
            />
          )}
        </Consumer>
      );
    }

    const { children, actions, selectors, effects } = props;

    const childrenProps = Object.assign(
      {},
      this.state,
      actions && mapSetStateToActions(this.handleSetState, actions),
      selectors && mapStateToSelectors(this.state, selectors),
      effects && mapPropsToEffects<State, Effects>(this.getEffectProps, effects)
    );

    return children(childrenProps);
  }
}

export default Container;
