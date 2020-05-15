import React, { useContext, useEffect, useRef } from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';
import { StateContext } from '../globals/context';

export function PrivateRoute(props: RouteProps) {
  const {children, ...rest} = props;
  const { state } = useContext(StateContext);
  const showElement = useRef(false);
  useEffect(() => {
    showElement.current = true;
  }, [state]);
  const isLoggedIn = state?.loginInfo && state?.loginInfo?.token?.length > 5;

  if(showElement.current) return (<></>);

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
