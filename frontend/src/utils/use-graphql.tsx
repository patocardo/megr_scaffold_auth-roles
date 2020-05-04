import { useState, useEffect, useContext } from 'react';
import { parseGraphQLError, ErrorType } from '../globals/error-handling';
import { IloginInfo } from '../globals/reducer';
import { StateContext } from '../globals/context';

type ParamsType = {
  method: string,
  body: string,
  headers: {
    [propName: string]: string
  }
}

type OptionsType = {
  params: ParamsType,
  flags?: string | string[]
}

type GraphQLType<T> = {
  data: null | T,
  errors: ErrorType[] | null,
  fetchData: (expression: string, isAuth?: boolean) => void
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
const baseOptions: OptionsType = {
  params: baseParams,
  flags: 'base'
};

export type BaseResponseType = {
  errors?: Array<any>,
  extensions?: {
    newToken: string
  }
}

type ResultType<T> = null |{
  data: T | null,
  token?: string,
  flags?: string | string[]
}

type GraphQLResultType<T> = {
  result: ResultType<T>,
  errors: ErrorType[] | null,
  fetchData: (expression: string, isAuth?: boolean, flags?: string | string[]) => void
}

export default function useGraphQL<T>(
  method: 'post' | 'get' | 'put' = 'post', 
  initial?: T, // starting value to set in state
): GraphQLResultType<T> {
  const startingValue = initial ? {data: initial} : null;
  const [ result, setResult ] = useState<ResultType<T>>(startingValue);
  const [ errors, setErrors ] = useState<ErrorType[] | null>(null);
  const { state } = useContext(StateContext);
  const [ options, setOptions ] = useState(baseOptions);

  function fetchData(
    expression: string,
    isAuth?: boolean,
    flags?: string[] | string // values to return with result
  ) {
    const params: ParamsType = {
      ...baseParams,
      body: JSON.stringify({ query: expression }),
      method: method.toUpperCase()
    };
    if (isAuth && state.loginInfo?.token) {
      params.headers.Authorization = `Bearer ${state.loginInfo.token}`;
    }
    const choices: OptionsType = {params};
    if (typeof flags !== 'undefined') {
      choices.flags = flags;
    }
    setOptions(choices);
  }

  useEffect(() => {
    (async () => {
      if (!options.params.body.length) return false;
      const response = await fetch(`${origin}/graphql`, options.params);
      const json = await response.json();

      const comesWithErrors = parseGraphQLError(json);

      if (comesWithErrors) {
        setErrors(comesWithErrors);
        return false;
      }
      const resObj: ResultType<T> = {data: json.data};
      if (state.loginInfo?.token) resObj.token = json.extensions.newToken;
      if (typeof options.flags != 'undefined') resObj.flags = options.flags;
      setResult(resObj);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return { result, errors, fetchData };
}

type GraphQLFnType = (expression: string, loginInfo?: IloginInfo | null) => void;

type GraphQLInputType2<T> = {
  // setData: (newData: T) => void,
  setErrors: (newErrors: ErrorType[]) => void,
  method?: 'post' | 'get' | 'put'
}

type GraphQL2ReturnType<T> = {
  data: T | null,
  fetchData: GraphQLFnType
}

// hook to run outside Context, it doesn't update token
export function useGraphQL2<T>(args: GraphQLInputType2<T>): GraphQL2ReturnType<T> {
  // const { setData, setErrors, method = 'post'} = args;
  const { setErrors, method = 'post'} = args;
  const [ data, setData ] = useState<T | null>(null)
  const [ options, setOptions ] = useState(baseParams);

  function fetchData(expression: string, loginInfo?: IloginInfo | null) {
    const params: ParamsType = {
      ...baseParams,
      body: JSON.stringify({ query: expression }),
      method: method.toUpperCase()
    };
    if (loginInfo?.token) {
      params.headers.Authorization = `Bearer ${loginInfo.token}`;
    }
    setOptions(params);
  }

  useEffect(() => {
    (async () => {
      if (!options.body.length) return false;
      const response = await fetch(`${origin}/graphql`, options);
      const json = await response.json();

      const comesWithErrors = parseGraphQLError(json);

      if (comesWithErrors) {
        setErrors(comesWithErrors);
        return false;
      }

      setData(json.data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return { data, fetchData};
}
