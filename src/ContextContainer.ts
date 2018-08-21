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
  EffectProps,
  SetStateWithType,
  MountContainer,
  SetContextState,
  Omit
} from "./types";

interface ContextContainerProps<S, C extends keyof S, A, E> {
  state: S;
  context: C;
  mountContainer: MountContainer<C>;
  setContextState: SetContextState<
    S,
    C,
    keyof A | keyof E | EventKeys | "initialState"
  >;
}

class ContextContainer<
  State,
  C extends keyof State,
  Actions = {},
  Selectors = {},
  Effects = {}
> extends React.Component<
  Omit<ContainerProps<State[C], C, Actions, Selectors, Effects>, "context"> &
    ContextContainerProps<State, C, Actions, Effects>
> {
  private ignoreState: State[C] | boolean = false;

  private unmount?: Function = undefined;

  constructor(
    props: Omit<
      ContainerProps<State[C], C, Actions, Selectors, Effects>,
      "context"
    > &
      ContextContainerProps<State, C, Actions, Effects>
  ) {
    super(props);
    const { state, setContextState, context, initialState } = props;
    if (!state[context]) {
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
    this.unmount = mountContainer(
      context,
      onMount && (() => onMount(this.getEffectProps("onMount")))
    );
  }

  shouldComponentUpdate(
    nextProps: Omit<
      ContainerProps<State[C], C, Actions, Selectors, Effects>,
      "context"
    > &
      ContextContainerProps<State, C, Actions, Effects>
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
  ): EffectProps<State[C]> => {
    const { state, context } = this.props;
    return {
      state: state[context],
      setState: (u, c) => this.handleSetState(u, c, type)
    };
  };

  handleSetState: SetStateWithType<
    State[C],
    keyof Actions | keyof Effects | EventKeys
  > = (updater, callback, type) => {
    const { setContextState, context, onUpdate } = this.props;
    if (!setContextState) return;

    const setState: SetStateWithType<State[C], typeof type> = (...args) =>
      setContextState(context, ...args);

    let prevState: Readonly<State[C]>;

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
      effects &&
        mapPropsToEffects<State[C], Effects>(this.getEffectProps, effects)
    );

    return children(childrenProps);
  }
}

export default ContextContainer;
