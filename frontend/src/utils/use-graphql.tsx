import { useState, useEffect, useContext, SetStateAction, Dispatch } from 'react';
import { parseGraphQLError, ErrorType, mapJSError} from '../globals/error-handling';
import { StateContext } from '../globals/context';

type ParamsType = {
  method: string,
  body: string,
  headers: {
    [propName: string]: string
  }
}

export type BaseResponseType = {
  errors?: Array<any>,
}

export type ResultType<T> = {
  data: T | null,
  flag: string
}
export type FetchPropsType = {
  expression: string,
  isAuth?: boolean,
  flag?: string,
}
export type GraphQLResultType<T> = {
  data: T | null,
  flag: string
  errors: ErrorType[] | null,
  fetchData: Dispatch<SetStateAction<FetchPropsType>>
}

const origin = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : window.location.origin;
  
const baseParams: ParamsType = {
  method: 'POST',
  body: '',
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
}
function getResolver(expression: string): string {
  const fit = expression.match(/(?:mutation|query|subscription)\s*{\s*(\w+)/mi);
  if(!fit) throw new Error('no resolver');
  return fit[1];
}

export default function useGraphQL<T>(initial: T | null = null): GraphQLResultType<T> {
  const [ result, setResult ] = useState<ResultType<T>>({ data: initial, flag:''});
  const [ errors, setErrors ] = useState<ErrorType[] | null>(null);
  const { contextState } = useContext(StateContext);
  const [ args, fetchData] = useState<FetchPropsType>({expression: '', isAuth: false});

  useEffect(() => {
    (async () => {
      if(args.expression.length < 6) return;
      const params: ParamsType = {
        ...baseParams,
        body: JSON.stringify({ query: args.expression }),
      };
      if (args.isAuth && contextState.token) {
        params.headers.Authorization = `Bearer ${contextState.token}`;
      }
      const response = await fetch(`${origin}/graphql`, params);
      const json = await response.json();

      const comesWithErrors = parseGraphQLError(json);

      if (comesWithErrors) {
        setErrors(comesWithErrors);
        return false;
      }
      const resObj: ResultType<T> = {data: json.data[getResolver(args.expression)], flag: args.flag || ''};
      setResult(resObj);
    })();
  }, [args.expression, args.isAuth, args.flag, contextState.token]);

  return { ...result, errors, fetchData };
}

type FetchGraphQLPropsType = {
  expression: string,
  token?: string,
}

export async function fetchGraphQl<T>(props: FetchGraphQLPropsType): Promise<T | null> {
  const { token, expression } = props;
  const resolver = getResolver(expression);
  const params: ParamsType = {
    ...baseParams,
    body: JSON.stringify({ query: expression }),
  };
  if (token && (token as string).length > 4) {
    params.headers.Authorization = `Bearer ${token}`;
  }
  let json = null;
  try {
    const response = await fetch(`${origin}/graphql`, params);
    json = await response.json();
    if(!json) return null;
  } catch (e) {
    throw new Error(JSON.stringify([mapJSError(e)]))
  } 
  const comesWithErrors = parseGraphQLError(json);
  if(comesWithErrors) throw new Error(JSON.stringify(comesWithErrors));
  if(!json?.data || typeof json?.data[resolver] === 'undefined') {
    const respErr = JSON.stringify({
      key: 'bad response',
      message: `property data and ${resolver} not found`
    });
    throw new Error(respErr);
  }
  return json.data[resolver];
}
