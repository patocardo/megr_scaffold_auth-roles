import { createContext } from 'react';

const SIGNED_IN = 'SIGNEDIN';
const SIGNED_OUT = 'SIGNEDOUT';

export interface IloginInfo {
  token: string;
  email: string;
}
export interface IcontextState {
  loginInfo: IloginInfo | null;
}

interface ISignInAction {
  type: typeof SIGNED_IN
  payload:  IcontextState
}

interface ISignOutAction {
  type: typeof SIGNED_OUT
}

export type ActionType = ISignInAction | ISignOutAction | undefined;
/*

function ISignIn(loginInfo: IloginInfo): ActionType {
  return {
    type: SIGNED_IN,
    payload: {
      loginInfo
    }
  }
}

function ISignOut(): ActionType {
  return {
    type: SIGNED_OUT
  }
}

export type LoginType = {
  token: string;
  email: string;
}
export type StateType = {
  loginInfo: LoginType | null;
}

type ActionType = {
  type: 'SIGNEDIN' | 'SIGNEDOUT'
  payload?: StateType
}

*/

export const initialContextState: IcontextState = {
  loginInfo: null
}


function reducer(state = initialContextState, action: ActionType): IcontextState {
  if (action) {
    switch(action.type) {
      case SIGNED_OUT: return {...state, loginInfo: null};
      case SIGNED_IN: return {...state, ...action.payload }
      default: return state;
    }
  }
  return state;
}

export default reducer;
