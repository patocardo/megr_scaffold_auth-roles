// Initial state
export interface IloginInfo {
  token: string;
  email: string;
}
export interface IcontextState {
  loginInfo: IloginInfo | null;
}

export const initialContextState: IcontextState = {
  loginInfo: null
}

// Reducer
export type ActionType = {
  type: string,
  payload?: IcontextState
}

export type DispatchType = (action: ActionType) => any;

const objReducer: any = {
  'SIGNEDOUT': (state: IcontextState, payload?: null) => ({...state, loginInfo: null}),
  'SIGNEDIN': (state: IcontextState, payload: {loginInfo: IloginInfo}) => ({...state, ...payload})
}

function reducer(state = initialContextState, action: ActionType): IcontextState {
  if (!action || !({}).hasOwnProperty.call(objReducer, action.type)) return state;
  return objReducer[action.type](state, action.payload);
}

export default reducer;
