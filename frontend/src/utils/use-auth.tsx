import /*React, */{ useState, useEffect, useContext, useRef } from 'react';
import { ErrorType } from '../globals/error-handling';
import { StateContext } from '../globals/context';
import { DispatchType, IloginInfo } from '../globals/reducer';
import useGraphQL, { useGraphQL2 } from './use-graphql';


type LogInReturnType = {
  errors: ErrorType[] | null,
  success: boolean,
  logIn: (email: string, password: string, remember: boolean) => void
}

type LoginDataType = {
  login: {
    token: string
  }
}

export default function useLogIn(): LogInReturnType {
  const [userData, setUserData] = useState({email: '', remember: false});
  const [success, setSuccess] = useState(false);
  const { result, errors, fetchData } = useGraphQL<LoginDataType>();
  const { dispatch } = useContext(StateContext);

  function logIn(email: string, password: string, remember: boolean): void {
    const cargo = `
      query {
        login(email: "${email}", password: "${password}", remember: ${remember}) {
          token
        }
      }
    `;
    setUserData({ email, remember });
    fetchData(cargo);
  }
  useEffect(() => {
    const token = result ? result?.data?.login?.token : null;
    if (token) {

      const loginInfo = { token, email: userData.email };

      if (userData.remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      dispatch({ type: 'SIGNEDIN', payload: { loginInfo }});

      setSuccess(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);
  return { success, errors, logIn}
}

type CheckIsAliveReturnType = {
  errors: ErrorType[] | null,
  email: string | null,
  checkIsAlive: () => void
}

type CheckIsDataType = {
  tokenIsAlive: {
    email: string
  }
}

type CheckIsAliveType = () => void;

type CheckIsAliveInputType = {
  loginInfo: IloginInfo | null,
  dispatch: DispatchType,
  setErrors: (newErrors: ErrorType[]) => void
}

export function useCheckIsAlive(args: CheckIsAliveInputType): CheckIsAliveType {
  const { loginInfo, dispatch, setErrors } = args;
  const token = useRef('');
  const { data, fetchData } = useGraphQL2<CheckIsDataType | null>({ setErrors });

  function checkIsAlive(): void {
    const storedToken: string | null = loginInfo?.token || sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!storedToken) return;
    const cargo = `
      query {
        tokenIsAlive(token: "${storedToken}") {
          email
        }
      }
    `;
    token.current = storedToken;
    fetchData(cargo);
  }

  useEffect(() => {
    if(data && token.current && data?.tokenIsAlive?.email) {
      const loginInfo = { token: token.current, email: data.tokenIsAlive.email };

      dispatch({ type: 'SIGNEDIN', payload: { loginInfo }});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return checkIsAlive;
}

type LogOutReturnType = {
  errors: ErrorType[] | null,
  success: boolean,
  logOut: () => void
}

export function useLogOut(): LogOutReturnType  {
  const { dispatch } = useContext(StateContext);
  const [ success, setSuccess ] = useState(false);

  function logOut(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    dispatch({ type: 'SIGNEDOUT'});
    setSuccess(true);
  }

  return { errors: null, success, logOut };
}
