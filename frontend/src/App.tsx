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
import { PrivateRoute } from './components/PrivateRoute';

import NavBar from './components/Navbar';
import withErrorBoundary, { ErrorType, logError } from './globals/error-handling';
const Login = lazy(() => import('./components/Login'));
const Users = lazy(() => import('./components/Users'));
const UserEdit = lazy(() => import('./components/UserEdit'));

function App() {
  const [ state, dispatch] = useReducer(reducer, initialContextState);
  const [ errors, setErrors ] = useState<ErrorType[] | null>(null);

  const checkIsAlive = useCheckIsAlive({ loginInfo: state.loginInfo, dispatch, setErrors });

  useEffect(() => {
    checkIsAlive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <PrivateRoute exact path='/users'><Users /></PrivateRoute>
              <PrivateRoute path='/user/:id'><UserEdit /></PrivateRoute>
              <Route path='/login' component={Login} />
            </Switch>
          </Suspense>
        </>
      </BrowserRouter>
    </StateContext.Provider>
  );
}

export default withErrorBoundary(App);
