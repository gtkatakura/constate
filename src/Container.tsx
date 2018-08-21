import * as React from "react";
import Consumer from "./Consumer";
import ContextContainer from "./ContextContainer";
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
  EffectMap
} from "./types";

class Container<
  State,
  C extends string | number | symbol,
  Actions = {},
  Selectors = {},
  Effects = {}
> extends React.Component<
  ContainerProps<State, C, Actions, Selectors, Effects>,
  State
> {
  static defaultProps = {
    initialState: {}
  };

  readonly state = this.props.initialState as State;

  private ignoreState: State | boolean = false;

  componentDidMount() {
    const { context, onMount } = this.props;
    if (!context && onMount) {
      onMount(this.getEffectProps("onMount"));
    }
  }

  shouldComponentUpdate(_: any, nextState: State) {
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
      onUnmount({
        ...this.getEffectProps("onUnmount"),
        setState: () => {}
      });
    }
  }

  getEffectProps = (
    type: keyof Actions | keyof Effects | EventKeys
  ): EffectProps<State> => ({
    state: this.state,
    setState: (u, c) => this.handleSetState(u, c, type)
  });

  handleSetState: SetStateWithType<
    State,
    keyof Actions | keyof Effects | EventKeys
  > = (updater, callback, type) => {
    let prevState: State;

    this.setState(
      state => {
        prevState = state;
        return parseUpdater(updater, state) as Pick<State, keyof State>;
      },
      () => {
        if (this.props.onUpdate && this.ignoreState !== this.state) {
          this.props.onUpdate({
            ...this.getEffectProps("onUpdate"),
            prevState,
            type
          });
        }

        if (callback) callback();
      }
    );
  };

  render() {
    const { context, children, actions, selectors, effects } = this.props;

    if (typeof context !== "undefined") {
      return (
        <Consumer>
          {({ state, setContextState, mountContainer }) => {
            const st = state as { [Key in C]: State };
            return (
              <ContextContainer
                {...this.props}
                state={st}
                context={context}
                setContextState={setContextState}
                mountContainer={mountContainer}
                effects={effects as EffectMap<typeof st[C], Effects>}
              />
            );
          }}
        </Consumer>
      );
    }

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
