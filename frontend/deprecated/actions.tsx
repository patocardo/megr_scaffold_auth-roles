import { initialContextState, IcontextState, DispatchType } from './reducer';
import { parseResponseError, IError, hasErrors } from './error-handling';
import { graphQLPost } from '../utils/http';
import useGraphQLPost from '../utils/use-graphql-post';


type ConsignType = {
  type: string,
  payload?: any,
  state?: IcontextState
}

export type CreateActionType = (action: ConsignType) => Promise<null | IcontextState | IError[] >;

export type ContextValueType = {
  state: IcontextState;
  dispatch: DispatchType;
  consign: CreateActionType
}

export const defaultContext: ContextValueType = {
  state: initialContextState,
  dispatch: () => false,
  consign: (action) => Promise.resolve(null)
}


type ConsignActionType = ConsignType & { dispatch: DispatchType };

// logIn types

export type UserLoginType = {
  email: string
  password: string
  remember: boolean
}

type LoginArgsType = ConsignActionType & { payload: UserLoginType };

type ResponseToken = {
  login: {
    token: string
  }
}

// checkIsAlive

type ResponseCheckAlive = {
  tokenIsAlive: {
    email: string
  }
}

const objActions: any = {
  logIn: async function(args: LoginArgsType): Promise<null | IcontextState | IError[]> {
    const { email, password, remember }  = args.payload;
    const cargo = `
      query {
        login(email: "${email}", password: "${password}", remember: ${remember}) {
          token
        }
      }
    `;
    try {
      const data = await graphQLPost<IError[] | ResponseToken >(cargo);
      if (data === null ) return null;
      if (hasErrors(data)) return data as IError[];

      const token = (data as ResponseToken).login.token;

      const loginInfo = { token, email };

      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      args.dispatch({ type: 'SIGNEDIN', payload: { loginInfo }});

      return { loginInfo };

    } catch (err) {
      return parseResponseError(err);
    }
  },
  checkIsAlive: async function(args: ConsignActionType): Promise<null | IcontextState | IError[]> {

    const token = args.state?.loginInfo?.token || sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) return Promise.resolve(null);
    const cargo = `
      query {
        tokenIsAlive(token: "${token}") {
          email
        }
      }
    `;

    try {

      const data = await graphQLPost<IError[] | ResponseCheckAlive >(cargo);
      if (data === null ) return null;
      if (hasErrors(data)) return data as IError[];

      const { email } = (data as ResponseCheckAlive).tokenIsAlive;

      const loginInfo = { token, email };

      args.dispatch({ type: 'SIGNEDIN', payload: { loginInfo }});

      return { loginInfo };

    } catch (err) {
      return parseResponseError(err);
    }
  },
  logOut: async function(args: ConsignActionType): Promise<null | IcontextState | IError[]> {
    // const token = args.state?.loginInfo?.token || sessionStorage.getItem('token') || localStorage.getItem('token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    args.dispatch({ type: 'SIGNEDOUT'});
    // TODO: service to allow disable tokens
    const out = await Promise.resolve(null);
    return out;
  }

}

export default function createActions(dispatch: DispatchType): CreateActionType {
  return (action: ConsignType) => {
    return objActions[action.type]({...action, dispatch});
  }
}

