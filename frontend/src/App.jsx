import React from 'react';
import {
  BrowserRouter,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import NavBar from './components/Navbar';
import Login from './components/Login';
import Users from './components/users';
import Bookings from './components/bookings';
import Events from './components/events';

import './App.css';

const comps = {
  users: Users,
  bookings: Bookings,
  events: Events,
  login: Login,
};


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <>
          <NavBar />
          <Switch>
            <Redirect from="/" to="/login" exact />
            {Object.keys(comps).map((elm) => (<Route path={`/${elm}`} component={comps[elm]} key={elm} />))}
          </Switch>
        </>
      </BrowserRouter>
    </div>
  );
}

export default App;
