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
  ContainerProps,
  State,
  Key,
  SetState,
  EffectArgs,
  EventKeys
} from "./types";

class Container<
  S extends State,
  ActionKeys extends Key,
  SelectorKeys extends Key,
  EffectKeys extends Key,
  Keys extends Key = ActionKeys | SelectorKeys | EffectKeys
> extends React.Component<
  ContainerProps<S, ActionKeys, SelectorKeys, EffectKeys, Keys>,
  S
> {
  static defaultProps = {
    initialState: {}
  };

  state: S = this.props.initialState;

  ignoreState: S | boolean = false;

  componentDidMount() {
    const { context, onMount } = this.props;
    if (!context && onMount) {
      onMount(this.getArgs({}, "onMount"));
    }
  }

  shouldComponentUpdate(_: any, nextState: S) {
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
    additionalArgs: object,
    type?: ActionKeys | SelectorKeys | EffectKeys | EventKeys
  ): EffectArgs<S, ActionKeys | SelectorKeys | EffectKeys | EventKeys> => ({
    state: this.state,
    setState: (u, c) => this.handleSetState(u, c, type),
    ...additionalArgs
  });

  handleSetState: SetState<
    S,
    ActionKeys | SelectorKeys | EffectKeys | EventKeys
  > = (updater, callback, type) => {
    let prevState: S;

    this.setState(
      state => {
        prevState = state;
        return parseUpdater(updater, state) as Pick<S, keyof S>;
      },
      () => {
        if (this.props.onUpdate && this.ignoreState !== this.state) {
          // @ts-ignore
          this.props.onUpdate(this.getArgs({ prevState, type }, "onUpdate"));
        }
        if (callback) callback();
      }
    );
  };

  render() {
    const { context } = this.props;
    if (typeof context !== "undefined") {
      return (
        <Consumer>
          {props => (
            <ContextContainer<S, ActionKeys, SelectorKeys, EffectKeys, Keys>
              {...props}
              {...this.props}
              state={{}}
              context={context}
            />
          )}
        </Consumer>
      );
    }

    const { children, actions, selectors, effects } = this.props;

    return children(
      Object.assign(
        {},
        this.state,
        actions &&
          mapSetStateToActions<S, ActionKeys>(this.handleSetState, actions),
        selectors &&
          mapStateToSelectors<S, SelectorKeys>(this.state, selectors),
        effects && mapArgsToEffects<S, EffectKeys>(this.getArgs, effects)
      )
    );
  }
}

export default Container;
