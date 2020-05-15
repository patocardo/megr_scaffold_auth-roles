import React, { Suspense, lazy, useReducer, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  // Redirect,
  Switch,
} from 'react-router-dom';
import {
  Grid,
  Typography,
  LinearProgress,
} from '@material-ui/core';
import { StateContext,  contextReducer, ContextStateOut } from './globals/context';
import { checkIsAlive } from './utils/use-auth';

import NavBar from './components/Navbar';
import withErrorBoundary, { ErrorType, logError, mapBackErrors } from './globals/error-handling';
const RenewToken = lazy(() => import('./components/RenewToken'));
const Home = lazy(() => import('./components/Home'));
const NoRoute = lazy(() => import('./components/NoRoute'));
const Login = lazy(() => import('./components/Login'));
const Users = lazy(() => import('./components/Users'));
const UserEdit = lazy(() => import('./components/UserEdit'));
const Roles = lazy(() => import('./components/Roles'));
const RoleEdit = lazy(() => import('./components/RoleEdit'));

const Fallback = () => (
  <>
  <Grid container justify="center" spacing={2}>
    <Grid item xs={8}>
      <LinearProgress />
    </Grid>
    <Grid item xs={8}>
      <Typography align="center" variant="h6">Loading App</Typography>
    </Grid>
  </Grid>
</>
)

const contextStateInitial = {...ContextStateOut, token: '_'};

function App() {
  const [ contextState, contextDispatch] = useReducer(contextReducer, contextStateInitial);
  const [ errors, setErrors ] = useState<ErrorType[] | null>(null);
 
  useEffect(() => {
    (async() => {
      if (contextState.token !== '_') return;
      try {
        const payload = await checkIsAlive(contextState.token.length > 3 ? contextState.token : '');
        if(payload.token.length < 3) {
          contextDispatch({type: 'SIGNEDOUT'});
        } else {
          contextDispatch({type: 'SIGNEDIN', payload});
        }
      } catch (err) {
        setErrors(mapBackErrors(err)) ;
      }        
    })();
  }, [contextState.token, contextDispatch]);

  useEffect(() => {
    if(errors) {
      // TODO: improve this log;
      errors.forEach(err => logError(err.message));
    }
  }, [errors]);

  const isLogged = contextState.token.length > 3;

  return (
    <StateContext.Provider value={{contextState, contextDispatch}}>
      <BrowserRouter>
        <>
          <NavBar />
          <Suspense fallback={<Fallback />}>
            {
              isLogged && (<RenewToken />)
            }
            <Switch>
              {
                isLogged && ([
                  <Route exact path='/users' key="users"><Users /></Route>,
                  <Route path='/user/:id' key="useredit"><UserEdit /></Route>,
                  <Route exact path='/roles' key="roles"><Roles /></Route>,
                  <Route path='/role/:id' key="roleedit"><RoleEdit /></Route>
                ])
              }
              <Route path='/login' component={Login} />
              <Route exact path='/'><Home /></Route>
              {
                contextState.token !== '_' && (
                  <Route path="*"><NoRoute /></Route>
                )
              }
            </Switch>
          </Suspense>
        </>
      </BrowserRouter>
    </StateContext.Provider>
  );
}

export default withErrorBoundary(App);