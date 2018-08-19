import * as React from "react";
import {
  mapSetStateToActions,
  mapStateToSelectors,
  mapArgsToEffects,
  parseUpdater
} from "./utils";
import {
  State,
  Key,
  ContainerProps,
  EventKeys,
  EffectArgs,
  SetState,
  StateUpdater,
  PartialState,
  SetStateCallback
} from "./types";

interface ContextContainerProps<S extends State> {
  context: string;
  state: {
    [key: string]: S;
  };
  mountContainer?: (
    context: string,
    onMount?: Function
  ) => (onUnmount: Function) => void;
  setContextState?: <K>(
    context: string,
    updater: StateUpdater<S> | PartialState<S>,
    callback?: SetStateCallback,
    type?: K
  ) => void;
}

class ContextContainer<
  S extends State,
  ActionKeys extends Key,
  SelectorKeys extends Key,
  EffectKeys extends Key,
  Keys extends Key = ActionKeys | SelectorKeys | EffectKeys
> extends React.Component<
  ContainerProps<S, ActionKeys, SelectorKeys, EffectKeys, Keys> &
    ContextContainerProps<S>
> {
  ignoreState: S | boolean = false;

  unmount?: Function = undefined;

  constructor(
    props: ContainerProps<S, ActionKeys, SelectorKeys, EffectKeys, Keys> &
      ContextContainerProps<S>
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
        onMount && (() => onMount(this.getArgs({}, "onMount")))
      );
    }
  }

  shouldComponentUpdate(
    nextProps: ContainerProps<S, ActionKeys, SelectorKeys, EffectKeys, Keys> &
      ContextContainerProps<S>
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
        onUnmount && (() => onUnmount(this.getArgs({}, "onUnmount")))
      );
    }
  }

  getArgs = (
    additionalArgs: object,
    type?: ActionKeys | SelectorKeys | EffectKeys | EventKeys
  ): EffectArgs<S, ActionKeys | SelectorKeys | EffectKeys | EventKeys> => {
    const { state, context } = this.props;
    return {
      state: state[context],
      setState: (u, c) => this.handleSetState(u, c, type),
      ...additionalArgs
    };
  };

  handleSetState: SetState<
    S,
    ActionKeys | SelectorKeys | EffectKeys | EventKeys
  > = (updater, callback, type) => {
    const { setContextState, context, onUpdate } = this.props;
    if (!setContextState) return;

    const setState: SetState<
      S,
      ActionKeys | SelectorKeys | EffectKeys | EventKeys
    > = (...args) => setContextState(context, ...args);

    let prevState: S;

    setState(
      state => {
        prevState = state;
        return parseUpdater(updater, state);
      },
      () => {
        if (onUpdate && this.ignoreState !== this.props.state[context]) {
          // @ts-ignore
          onUpdate(this.getArgs({ prevState, type }, "onUpdate"));
        }
        if (callback) callback();
      },
      type
    );
  };

  render() {
    const { children, actions, selectors, effects } = this.props;
    const { state } = this.getArgs({});
    return children(
      Object.assign(
        {},
        state,
        actions &&
          mapSetStateToActions<S, ActionKeys>(this.handleSetState, actions),
        selectors && mapStateToSelectors<S, SelectorKeys>(state, selectors),
        effects && mapArgsToEffects<S, EffectKeys>(this.getArgs, effects)
      )
    );
  }
}

export default ContextContainer;
