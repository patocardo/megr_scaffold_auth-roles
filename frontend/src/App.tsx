import React, { Suspense, lazy, useReducer, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  // Redirect,
  Switch,
} from 'react-router-dom';

import reducer, { initialContextState } from './globals/reducer';
import { StateContext } from './globals/context';
import { useCheckIsAlive } from './utils/use-auth';

import NavBar from './components/Navbar';
import withErrorBoundary, { IError, logError } from './globals/error-handling';
const Login = lazy(() => import('./components/Login'));
const Users = lazy(() => import('./components/Users'));

type PageCompsType = string[];

function App() {
  const [ state, dispatch] = useReducer(reducer, initialContextState);
  const [ errors, setErrors ] = useState<IError[] | null>(null);

  const checkIsAlive = useCheckIsAlive({ loginInfo: state.loginInfo, dispatch, setErrors });

  useEffect(() => {
    checkIsAlive();
  }, []);

  useEffect(() => {
    if(errors) {
      // TODO: improve this log;
      errors.forEach(err => logError(err.message));
    }
  }, [errors]);

  return (
    <StateContext.Provider value={{state, dispatch}}>
      <BrowserRouter>
        <>
          <NavBar />
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              {
                state.loginInfo?.token && (
                  <Route from='/users' component={Users} />
                )
              }
              <Route from='/login' component={Login} />
            </Switch>
          </Suspense>
        </>
      </BrowserRouter>
    </StateContext.Provider>
  );
}

export default withErrorBoundary(App);
