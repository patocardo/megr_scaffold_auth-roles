import { ActionType, initialContextState, IcontextState } from './reducer';
import { parseResponseError, parseGraphQLError, IError } from './errorHandling';


type DispatchType = (action: ActionType) => any;

export interface IStateContext {
  state: IcontextState,
  signIn: (userData: IUserLogin) => Promise<boolean | IcontextState | IError[] > | boolean | IcontextState | IError[]
}

export const defaultContext: IStateContext = {
  state: initialContextState,
  signIn: (userData: IUserLogin) => false
}

export interface IUserLogin {
  email: string
  password: string
}

export default function createActions(dispatch: DispatchType) {
  return {
    signIn: async (userData: IUserLogin) => {

      const requestBody = {
        query: `
          query {
            login(email: "${userData.email}", password: "${userData.password}") {
              userId
              token
            }
          }
        `,
      };
      try {

        const response = await fetch('http://localhost:8000/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
        });
        const json = await response.json();

        const comesWithErrors = parseGraphQLError(json);

        if (comesWithErrors) return comesWithErrors;

        const loginInfo = {
          token: json.data.login.token,
          email: userData.email
        }

        dispatch({ type: 'SIGNEDIN', payload: { loginInfo }});

        return { loginInfo };

      } catch (err) {
        const errors = parseResponseError(err);
        if(!errors) return false;
        return errors;
      }


    }
  }
}

