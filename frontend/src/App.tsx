import React, { Suspense, lazy, useReducer, useEffect } from 'react';
import {
  BrowserRouter,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import NavBar from './components/Navbar';
import withErrorBoundary from './globals/errorHandling';
import { StateContext } from './globals/contextElements';
import reducer, { initialContextState } from './globals/reducer';
import createActions, {ContextValueType} from './globals/actions';

function App() {

  const [ state, dispatch] = useReducer(reducer, initialContextState);
  const consign = createActions(dispatch);
  let contextValue: ContextValueType = {state, dispatch, consign};
  useEffect(() => {
    consign({type:'checkIsAlive'});
  }, []);

  const { loginInfo } = state;

  const pageComps = loginInfo ? ['Users', 'Bookings', 'Events', 'Login'] : ['Login'];

  return (
    <StateContext.Provider value={contextValue}>
      <BrowserRouter>
        <>
          <NavBar />
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Redirect from="/" to="/login" exact />
              {
                pageComps.map((page: string) => {
                  const Compo = lazy(() => import('./components/' + page));
                  return (<Route from={'/' + page} component={Compo} key={page} />);
                })
              }
            </Switch>
          </Suspense>
        </>
      </BrowserRouter>
    </StateContext.Provider>
  );
}

export default withErrorBoundary(App);

/*
    <DispatchContext.Provider value={dispatch}>
    </DispatchContext.Provider>

 */