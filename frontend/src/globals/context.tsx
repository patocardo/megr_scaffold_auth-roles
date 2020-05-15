import { createContext, Dispatch } from 'react';

export type ContextStateType = {
  token: string,
  email: string,
  expiration: number | null,
  remember: boolean
}

export type ContextPayloadType = {
  token?: string,
  email?: string,
  expiration?: number,
  remember?: boolean,
}

export type ActionType = { 
  type: string,
  payload?: ContextPayloadType
}

export type ContextValueType = {
  contextState: ContextStateType,
  contextDispatch: Dispatch<ActionType>,
}

export const ContextStateOut = {token: '', email: '', expiration: null, remember: false};

export const defaultContext: ContextValueType = {
  contextState: ContextStateOut,
  contextDispatch: () => false,
}

export const StateContext = createContext(defaultContext);

export function contextReducer(state: ContextStateType, action: ActionType): ContextStateType {
  const { expiration = 0, email = '', token = '', remember = false} = action.payload || {};
  switch (action.type) {
    case 'SIGNEDOUT': return ContextStateOut;
    case 'SIGNEDIN':
      if(!email.length || !expiration || !token.length) return {...state};
      return {email, token, expiration, remember};
    case 'REFRESHEDTOKEN':
      if(!expiration || !token?.length) return {...state};
      return {...state, token: token, expiration};
    default: return {...state};
  }
}
