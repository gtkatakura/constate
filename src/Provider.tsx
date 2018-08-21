/* eslint-disable react/sort-comp, react/no-unused-state, no-underscore-dangle */
import * as React from "react";
import Context from "./Context";
import { parseUpdater } from "./utils";
import { SetContextState, StateUpdater, StateCallback } from "./types";

const reduxDevtoolsExtension =
  typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__;

interface OnMountProps<S, C extends keyof S, K> {
  state: S;
  setContextState: SetContextState<S, C, K>;
}

interface OnUpdateProps<S, C extends keyof S, K> {
  prevState: S;
  state: S;
  setContextState: SetContextState<S, C, K>;
  context: C;
  type: K;
}

interface OnUnmountProps<S> {
  state: S;
}

interface ProviderProps<S, C extends keyof S, K> {
  initialState?: Partial<S>;
  devtools?: boolean;
  onMount?: (props: OnMountProps<S, C, K>) => void;
  onUpdate?: (props: OnUpdateProps<S, C, K>) => void;
  onUnmount?: (props: OnUnmountProps<S>) => void;
}

type MountContainer<C> = (
  context: C,
  onMount?: () => void
) => (onUnmount?: () => void) => void;

interface ProviderState<S, C extends keyof S, K> {
  state: S;
  setContextState: SetContextState<S, C, K>;
  mountContainer: MountContainer<C>;
}

type Containers<S> = { [Key in keyof S]?: number };

class Provider<State, C extends keyof State, K> extends React.Component<
  ProviderProps<State, C, K>,
  ProviderState<State, C, K>
> {
  static defaultProps = {
    initialState: {}
  };

  private containers: Containers<State> = {};

  private devtools?: ReturnType<ReduxDevtoolsExtension["connect"]>;

  constructor(props: ProviderProps<State, C, K>) {
    super(props);
    const { devtools, initialState } = props;

    this.state = {
      state: initialState as State,
      mountContainer: this.mountContainer,
      setContextState: this.setContextState
    };

    // istanbul ignore next
    if (devtools && reduxDevtoolsExtension) {
      this.devtools = reduxDevtoolsExtension.connect({ name: "Context" });
      this.devtools.init(initialState);
      this.devtools.subscribe(message => {
        if (message.type === "DISPATCH" && message.state) {
          this.setState(state => ({
            state: Object.assign({}, state.state, JSON.parse(message.state))
          }));
        }
      });
    }
  }

  componentDidMount() {
    if (this.props.onMount) {
      this.props.onMount(this.getProps("Provider/onMount"));
    }
  }

  componentWillUnmount() {
    if (this.props.onUnmount) {
      const { setContextState, ...args } = this.getProps();
      this.props.onUnmount(args);
    }
    // istanbul ignore next
    if (this.devtools && reduxDevtoolsExtension) {
      this.devtools.unsubscribe();
      reduxDevtoolsExtension.disconnect();
    }
  }

  mountContainer: MountContainer<C> = (context, onMount) => {
    if (!this.containers[context]) {
      this.containers[context] = 0;
      if (onMount) this.setState(null, onMount);
    }
    this.containers[context] += 1;

    return onUnmount => {
      if (this.containers[context] === 1 && onUnmount) onUnmount();
      this.containers[context] -= 1;
    };
  };

  setContextState: SetContextState<State, C, K> = (
    context,
    updater,
    callback,
    type
  ) => {
    let prevState: State;

    const updaterFn: StateUpdater<ProviderState<State, C, K>> = state => {
      prevState = state.state;
      return {
        state: Object.assign({}, state.state, {
          [context]: Object.assign(
            {},
            state.state[context],
            parseUpdater(updater, state.state[context] || {})
          )
        })
      };
    };

    const callbackFn = () => {
      if (this.props.onUpdate) {
        const onUpdateProps = {
          ...this.getProps("Provider/onUpdate"),
          prevState,
          context,
          type
        };
        this.props.onUpdate(onUpdateProps);
      }
      if (callback) callback();
      // istanbul ignore next
      if (this.devtools && type) {
        const devtoolsType = context ? `${context}/${type}` : type;
        this.devtools.send(devtoolsType, this.state.state);
      }
    };

    this.setState(updaterFn, callbackFn);
  };

  getProps = (type?: K) => {
    const { state, setContextState } = this.state;
    return {
      state,
      setContextState: (
        context: C,
        updater: StateUpdater<State[C]>,
        callback?: StateCallback
      ) => setContextState(context, updater, callback, type)
    };
  };

  render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }
}

export default Provider;
