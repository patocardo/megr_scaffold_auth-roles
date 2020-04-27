import React, { createContext, useReducer, useEffect, ReactElement } from 'react';

import reducer, { initialContextState, IcontextState, DispatchType } from './reducer';
import { useCheckIsAlive } from '../utils/use-auth';

export type ContextValueType = {
  state: IcontextState;
  dispatch: DispatchType;
}

export const defaultContext: ContextValueType = {
  state: initialContextState,
  dispatch: () => false,
}

export const StateContext = createContext(defaultContext);
/*
type ProviderVarsType = {
  state: IcontextState,
  dispatch: DispatchType,
  wrapper: (child: React.ReactElement) => React.ReactElement
}

export default function useProvider(): ProviderVarsType {
  const [ state, dispatch] = useReducer(reducer, initialContextState);
  const { checkIsAlive} = useCheckIsAlive();

  useEffect(() => {
    checkIsAlive();
  }, []);

  const wrapper = (child: React.ReactElement) => {
    return (<StateContext.Provider value={{state, dispatch}}>
      {child}
    </StateContext.Provider>);
  }

  return { state, dispatch, wrapper  }

}
*/