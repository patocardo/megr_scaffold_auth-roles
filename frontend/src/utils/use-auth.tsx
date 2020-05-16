import { useEffect, useContext, useState, SetStateAction, Dispatch, useRef } from 'react';
import { ErrorType, mapJSError } from '../globals/error-handling';
import { StateContext } from '../globals/context';
import useGraphQL, { fetchGraphQl } from './use-graphql';
// import { invalidRules } from '../components/PasswordInput'; //use It for re-check password validity before api request
import useEffectDeep from '../utils/use-effect-deep';

export type LogInPropsType = {
  email: string,
  password: string,
  remember: boolean
}
type LogInReturnType = {
  loginErrors: ErrorType[] | null,
  logIn: Dispatch<SetStateAction<LogInPropsType>>
};

type LoginDataType = {
  token: string,
  expiration: number
}

export default function useLogIn(): LogInReturnType {
  const { contextDispatch } = useContext(StateContext);
  const [ loginData, logIn] = useState<LogInPropsType>({email: '', password: '', remember: false});
  const [ loginErrors, setLoginErrors ] = useState<ErrorType[]>([]);
  const newToken = useRef('');

  useEffect(() => {
    (async () => {
      try {
        if(
          loginData.email.length > 4 &&
          loginData.password.length > 3
        ){
          const expression = `
            query {
              login(email: "${loginData.email}", password: "${loginData.password}", remember: ${loginData.remember.toString()}) {
                token
                expiration
              }
            }
          `;
          const data = await fetchGraphQl<LoginDataType>({ expression });
          if (data && data.token?.length > 3) {
            const payload = {...data, email: loginData.email };
            if (loginData.remember) {
              localStorage.setItem('token', data.token);
            } else {
              sessionStorage.setItem('token', data.token);
            }
            newToken.current = data.token;
            contextDispatch({ type: 'SIGNEDIN', payload});
            logIn(prev => ({...prev, email: ''}));
          }          
        }
      } catch(err) {
        setLoginErrors([mapJSError(err)]);
      }
    })();

  },[loginData.email, loginData.password, loginData.remember, contextDispatch])

  return {loginErrors, logIn};
}

type CheckIsAliveReturnType = {
  email: string,
  expiration: number,
  token: string,
  remember: boolean
}

type IsAliveResponseType = {
  email: string,
  expiration: number,
  remember: boolean
}
const deadToken = {email: '', token: '', expiration: 0, remember: false};

export async function checkIsAlive(currentToken?: string): Promise<CheckIsAliveReturnType> {
  const token: string | null = currentToken || sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) return Promise.resolve(deadToken);
  const expression = `query {
    tokenIsAlive(token: "${token}") {
      email,
      expiration,
      remember
    }
  }`;
  const data = await fetchGraphQl<IsAliveResponseType>({expression, token});
  return !!data?.email ? { ...data, token} : deadToken;
}

type UseRefreshReturnType = {
  refreshErrors: ErrorType[] | null,
  refreshToken: Dispatch<SetStateAction<boolean>>
}

export function useRefreshToken(): UseRefreshReturnType {
  const { data, errors, fetchData} = useGraphQL<LoginDataType>({token: '', expiration: 0});
  const { contextState, contextDispatch } = useContext(StateContext);
  const [ doRefresh, refreshToken] = useState(false);

  useEffect(() => {
    if(doRefresh) {
      const token: string | null = contextState.token || sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) return;
      const expression = `query { 
        refreshToken(token: "${token}") {
          token
          expiration
        } 
      }`;
      fetchData({expression, isAuth: true});
      refreshToken(false);
    }
  }, [doRefresh, contextState.token, fetchData])

  useEffectDeep(() => {
    if (data && data?.token.length > 3) {
      const payload = {...data, email: contextState.email };

      if (contextState.remember) {
        localStorage.setItem('token', data.token);
      } else {
        sessionStorage.setItem('token', data.token);
      }

      contextDispatch({ type: 'REFRESHEDTOKEN', payload});
    }
  }, [data, contextDispatch, contextState.email, contextState.remember]);

  return {refreshErrors: errors, refreshToken};
}

type LogOutReturnType = {
  logOutErrors: ErrorType[] | null,
  logOut: Dispatch<SetStateAction<boolean>>
};

export function useLogOut(): LogOutReturnType  {
  const { contextDispatch } = useContext(StateContext);
  const [ doLogOut, logOut] = useState(false);

  useEffect(() => {
    if(doLogOut){
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      contextDispatch({ type: 'SIGNEDOUT'});
    }
  }, [doLogOut, contextDispatch])

  return {logOutErrors: null, logOut};
}
