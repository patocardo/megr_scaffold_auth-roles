import React, { useState, useEffect, useContext } from 'react';
import { parseGraphQLError, IError } from '../globals/error-handling';
import { IloginInfo } from '../globals/reducer';
import { StateContext } from '../globals/context';

type optionsType = {
  method: string,
  body: string,
  headers: {
    [propName: string]: string
  }
}

type GraphQLType<T> = {
  data: null | T,
  errors: IError[] | null,
  fetchData: (expression: string, isAuth?: boolean) => void
}

const origin = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : window.location.origin;

const baseOptions: optionsType = {
  method: 'POST',
  body: '',
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
};

export type BaseResponseType = {
  errors?: Array<any>,
  extensions?: {
    newToken: string
  }
}

type ResultType<T> = null |{
  data: T | null,
  token?: string
}

type GraphQLResultType<T> = {
  result: ResultType<T>,
  errors: IError[] | null,
  fetchData: (expression: string, isAuth?: boolean) => void
}

export default function useGraphQL<T>(method: 'post' | 'get' | 'put' = 'post'): GraphQLResultType<T> {
  const [ result, setResult ] = useState<ResultType<T>>(null);
  const [ errors, setErrors ] = useState<IError[] | null>(null);
  const { state } = useContext(StateContext);
  const [ options, setOptions ] = useState(baseOptions);


  function fetchData(expression: string, isAuth?: boolean) {
    const params = {
      ...baseOptions,
      body: JSON.stringify({ query: expression }),
      method: method.toUpperCase()
    };
    if (isAuth && state.loginInfo?.token) {
      params.headers.Authorization = `Bearer ${state.loginInfo.token}`;
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

      if (state.loginInfo?.token) {
        const token = json.extensions.newToken;
        setResult({ data: json.data, token });
      } else {
        setResult({ data: json.data });
      }
    })();

  }, [options]);

  return { result, errors, fetchData };
}

type GraphQLFnType = (expression: string, loginInfo?: IloginInfo | null) => void;

type GraphQLInputType2<T> = {
  // setData: (newData: T) => void,
  setErrors: (newErrors: IError[]) => void,
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
  const [ options, setOptions ] = useState(baseOptions);

  function fetchData(expression: string, loginInfo?: IloginInfo | null) {
    const params = {
      ...baseOptions,
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

  }, [options]);

  return { data, fetchData};
}
