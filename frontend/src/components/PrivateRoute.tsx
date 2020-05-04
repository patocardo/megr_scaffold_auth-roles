import React, { useContext } from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';
import { StateContext } from '../globals/context';

export function PrivateRoute(props: RouteProps) {
  const {children, ...rest} = props;
  const { state } = useContext(StateContext);
  const isLoggedIn = state?.loginInfo?.token;

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}
