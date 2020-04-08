import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import NavBar from './components/Navbar';
/*
import Login from './components/Login';
import Users from './components/Users';
import Bookings from './components/Bookings';
import Events from './components/Events';
*/
import './App.css';
/*
const comps = {
  users: Users,
  bookings: Bookings,
  events: Events,
  login: Login,
};
*/
//             {Object.keys(comps).map((elm: string) => (<Route path={`/${elm}`} component={comps[elm]} key={elm} />))}


function App() {
  const pageComps = ['Users', 'Bookings', 'Events', 'Login'];

  return (
    <div className="App">
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
    </div>
  );
}

export default App;
