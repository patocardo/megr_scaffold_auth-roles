import React, { createContext, useReducer, useEffect, ReactElement } from 'react';

import reducer, { initialContextState } from './reducer';
import createActions, {defaultContext} from './actions';

export const StateContext = createContext(defaultContext);

export default function useProvider() {
  const [ state, dispatch] = useReducer(reducer, initialContextState);
  const consign = createActions(dispatch);

  console.log('state', state);

  const wrapper = (child: React.ReactElement) => {
    return (<StateContext.Provider value={{state, dispatch, consign}}>
      {child}
    </StateContext.Provider>);
  }
  /*

  useEffect(() => {
    consign({type:'checkIsAlive'});
  }, [consign]);

*/
  return { state, dispatch, consign, StateContext  }

}

