import { createContext } from 'react';

import { initialContextState, IcontextState, DispatchType } from './reducer';

export type ContextValueType = {
  state: IcontextState;
  dispatch: DispatchType;
}

export const defaultContext: ContextValueType = {
  state: initialContextState,
  dispatch: () => false,
}

export const StateContext = createContext(defaultContext);
