import React, { Suspense, lazy, useReducer, useContext } from 'react';
import {
  BrowserRouter,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import NavBar from './components/Navbar';
import withErrorBoundary from './globals/errorHandling';
import Provider, { StateContext } from './globals/contextElements';
import reducer, {initialContextState} from './globals/reducer';

function App() {

  const { state } = useContext(StateContext);

  const { loginInfo } = state;

  const pageComps = loginInfo ? ['Users', 'Bookings', 'Events', 'Login'] : ['Login'];

  return (
    <Provider>
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
    </Provider>
  );
}

export default withErrorBoundary(App);

/*
    <DispatchContext.Provider value={dispatch}>
    </DispatchContext.Provider>

 */