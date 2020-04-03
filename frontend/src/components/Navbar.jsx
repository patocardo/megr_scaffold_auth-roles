import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavBar() {
  const targets = ['Users', 'Bookings', 'Events', 'Login'];
  return (
    <nav>
      <span role="img" aria-label="logo">😃</span>
      {targets.map((elm) => (<NavLink to={`/${elm.toLowerCase()}`} key={elm}>{elm}</NavLink>))}
    </nav>
  );
}
