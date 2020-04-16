import { parseGraphQLError, IError } from '../globals/errorHandling';
import { IcontextState, DispatchType } from '../globals/reducer';

type optionsType = {
  method: string,
  body: string,
  headers: {
    [name: string]: string
  }
}
/*
    'Content-type': string,
    Accept: string,
    Authorization?: string
 */
export async function graphQLPost<T>(
  payload: string,
  context?: {
    state: IcontextState,
    dispatch: DispatchType
  }

): Promise<T | IError[] | null > {
  const origin = window.location.hostname == 'localhost'
    ? 'http://localhost:8000'
    : window.location.origin;
  const options: optionsType = {
    method: 'POST',
    body: JSON.stringify({ query: payload }),
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (context?.state?.loginInfo?.token) {
    options.headers.Authorization = `Bearer ${context.state.loginInfo.token}`;
  }
  const response = await fetch(`${origin}/graphql`, options);
  const json = await response.json();

  const comesWithErrors = parseGraphQLError(json);

  if (!comesWithErrors && context?.state?.loginInfo?.token) {
    const fnQueried = Object.keys(json.data)[0];
    const token = json.extensions.newToken;
    const loginInfo = {...context?.state?.loginInfo, token};

    context.dispatch({type: 'SIGNEDIN', payload: { loginInfo }});
  }

  return comesWithErrors || json.data;

}
