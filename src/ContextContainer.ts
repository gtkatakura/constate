import * as React from "react";
import {
  mapSetStateToActions,
  mapStateToSelectors,
  parseUpdater,
  mapPropsToEffects
} from "./utils";
import {
  ContainerProps,
  EventKeys,
  StateUpdater,
  EffectProps,
  SetStateWithType,
  StateCallback
} from "./types";

interface ContextContainerProps<State> {
  context: string;
  state: {
    [key: string]: State;
  };
  mountContainer?: (
    context: string,
    onMount?: Function
  ) => (onUnmount: Function) => void;
  setContextState?: (
    context: string,
    updater: StateUpdater<State> | Partial<State>,
    callback?: StateCallback,
    type?: any
  ) => void;
}

class ContextContainer<
  State,
  Actions = {},
  Selectors = {},
  Effects = {}
> extends React.Component<
  ContainerProps<State, Actions, Selectors, Effects> &
    ContextContainerProps<State>,
  State
> {
  private ignoreState: State | boolean = false;

  private unmount?: Function = undefined;

  constructor(
    props: ContainerProps<State, Actions, Selectors, Effects> &
      ContextContainerProps<State>
  ) {
    super(props);
    const { state, setContextState, context, initialState } = props;
    if (!state[context] && setContextState) {
      setContextState(
        context,
        currentState => ({
          ...(initialState as object),
          ...(currentState as object)
        }),
        undefined,
        "initialState"
      );
    }
  }

  componentDidMount() {
    const { mountContainer, context, onMount } = this.props;
    if (mountContainer) {
      this.unmount = mountContainer(
        context,
        onMount && (() => onMount(this.getEffectProps("onMount")))
      );
    }
  }

  shouldComponentUpdate(
    nextProps: ContainerProps<State, Actions, Selectors, Effects> &
      ContextContainerProps<State>
  ) {
    const { state } = this.props;
    const { context, shouldUpdate, state: nextState } = nextProps;
    if (shouldUpdate) {
      const couldUpdate = shouldUpdate({
        state: state[context] || {},
        nextState: nextState[context]
      });
      this.ignoreState = !couldUpdate && nextState[context];
      return couldUpdate;
    }
    return true;
  }

  componentWillUnmount() {
    const { onUnmount } = this.props;
    if (this.unmount) {
      this.unmount(
        onUnmount && (() => onUnmount(this.getEffectProps("onUnmount")))
      );
    }
  }

  getEffectProps = (
    type: keyof Actions | keyof Effects | EventKeys
  ): EffectProps<State> => {
    const { state, context } = this.props;
    return {
      state: state[context],
      setState: (u, c) => this.handleSetState(u, c, type)
    };
  };

  handleSetState: SetStateWithType<
    State,
    keyof Actions | keyof Effects | EventKeys
  > = (updater, callback, type) => {
    const { setContextState, context, onUpdate } = this.props;
    if (!setContextState) return;

    const setState: SetStateWithType<State, typeof type> = (...args) =>
      setContextState(context, ...args);

    let prevState: State;

    setState(
      state => {
        prevState = state;
        return parseUpdater(updater, state);
      },
      () => {
        if (onUpdate && this.ignoreState !== this.props.state[context]) {
          onUpdate({
            ...this.getEffectProps("onUpdate"),
            prevState,
            type
          });
        }

        if (callback) callback();
      },
      type
    );
  };

  render() {
    const { context, children, actions, selectors, effects } = this.props;
    const state = this.props.state[context];
    const childrenProps = Object.assign(
      {},
      state,
      actions && mapSetStateToActions(this.handleSetState, actions),
      selectors && mapStateToSelectors(state, selectors),
      effects && mapPropsToEffects<State, Effects>(this.getEffectProps, effects)
    );

    return children(childrenProps);
  }
}

export default ContextContainer;
