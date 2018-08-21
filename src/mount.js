/* eslint-disable no-param-reassign, no-use-before-define, no-unused-expressions */
import * as React from "react";
import {
  mapSetStateToActions,
  mapStateToSelectors,
  mapPropsToEffects,
  parseUpdater
} from "./utils";

const getProps = (Container, props) => {
  const getNextProps = rendered => {
    const nextProps = { ...rendered.props, ...props };
    return getProps(rendered.type, nextProps);
  };

  if (React.isValidElement(Container)) {
    return getNextProps(Container);
  }

  const container = new Container({ children: () => null });
  const rendered = container.render ? container.render() : container;

  if (!React.isValidElement(rendered)) {
    return props;
  }

  return getNextProps(rendered);
};

const mapToDraft = (object, draft) =>
  Object.keys(object).forEach(key => {
    draft[key] = object[key];
  });

const mount = Container => {
  const {
    initialState,
    actions,
    selectors,
    effects,
    onMount,
    onUpdate,
    shouldUpdate
  } = getProps(Container);

  const draft = { ...initialState };
  const state = { ...initialState };

  const setState = (updater, callback, type) => {
    const prevState = { ...state };

    mapToDraft(parseUpdater(updater, draft), draft);

    const couldUpdate = shouldUpdate
      ? shouldUpdate({ state, nextState: draft })
      : true;

    if (couldUpdate) {
      mapToDraft(draft, state);
    }

    if (onUpdate && couldUpdate) {
      onUpdate({ ...getArgs("onUpdate"), prevState, type });
    }

    if (callback) callback();
  };

  const getArgs = type => ({
    state,
    setState: (u, c) => setState(u, c, type)
  });

  typeof onMount === "function" && onMount(getArgs("onMount"));

  actions && mapToDraft(mapSetStateToActions(setState, actions), state);
  selectors && mapToDraft(mapStateToSelectors(state, selectors), state);
  effects && mapToDraft(mapPropsToEffects(getArgs, effects), state);

  return state;
};

export default mount;
