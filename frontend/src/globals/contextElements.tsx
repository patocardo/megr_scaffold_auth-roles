import React, { createContext, useReducer, ReactElement } from 'react';

import reducer, { initialContextState } from './reducer';
import createActions, {IStateContext, defaultContext} from './actions';

export const StateContext = createContext(defaultContext);

interface IProvider {
  children: ReactElement | ReactElement[]
}

export default function Provider(props: IProvider){
  const [ state, dispatch] = useReducer(reducer, initialContextState);

  const actions = createActions(dispatch);

  return (
    <StateContext.Provider value={{state, ...actions}}>
      {props.children}
    </StateContext.Provider>
  )
}

/*
    <DispatchContext.Provider value={dispatch}>
    </DispatchContext.Provider>

 */

