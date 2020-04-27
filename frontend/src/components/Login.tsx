import React, { useState, useContext, useEffect } from 'react';
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  CircularProgress } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { validate } from 'email-validator';

import { StateContext } from '../globals/context';
import { IError, logError, hasErrors } from '../globals/error-handling';
import useLogIn, { useLogOut } from '../utils/use-auth';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.type === 'light' 
      ? theme.palette.grey[50]
      : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Login() {
  const [status, setStatus] = useState('loggedout');
  const [userData, setUserData] = useState({ email: '', password: '', remember: false });
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [responseError, setResponseError] = useState<IError[]|boolean>(false);
  const [ toSubmit, setToSubmit ] = useState(false);
  const [ toOut, setToOut ] = useState(false);
  const { state } = useContext(StateContext);
  const { success, errors: loginErrors, logIn } = useLogIn();
  const { success: out, errors: logoutErrors, logOut } = useLogOut();
  const classes = useStyles();
  let internal = (<div></div>);

  useEffect(() => {
    if(state && state.loginInfo?.token) {
      setStatus('logged');
    }
  }, []);

  useEffect(() => {
            // TODO: refine possible errors

  }, [loginErrors]);

  useEffect(() => {
    if(success) setStatus('logged');
  }, [success]);

  useEffect(() => {
    if(out) setStatus('logged');
  }, [out]);

  useEffect(() => {
    if (toSubmit && validate(userData.email) && userData.password.length > 4) {
      setStatus('submitting');
      logIn(userData.email, userData.password, userData.remember);
    }
  }, [toSubmit]);

  useEffect(() => {
    if (toOut) {
      setStatus('leaving');
      logOut();
    }
  }, [toOut]);

  function handleEmail(evt: React.ChangeEvent<HTMLInputElement>) {
    const email = evt.target.value;
    setIsValidEmail(validate(email));
    setUserData({ ...userData, email });
  }
  function handlePassword(evt: React.ChangeEvent<HTMLInputElement>) {
    const password = evt.target.value;
    setUserData({ ...userData, password });
  }
  function handleRemember(evt: React.ChangeEvent<HTMLInputElement>) {
    setUserData({ ...userData, remember: evt.target.checked });
  }

  function submit(evt: React.MouseEvent) {
    evt.preventDefault();
    setToSubmit(true);
  }

  function toLogout(evt: React.MouseEvent) {
    evt.preventDefault();
    setToOut(true);
  }

  switch (status) {
    case 'submitting':
      internal = (
        <div>
          <CircularProgress />
          <Typography component="h1" variant="h5">
            Sending user&#39;s data
          </Typography>
        </div>
      );
      break;
    case 'logged':
      internal = (
        <div>
          <Typography component="h1" variant="h5">
            Welcome
          </Typography>
          <Typography component="h1" variant="h4">
            { state?.loginInfo?.email }
          </Typography>
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={toLogout}
          >
            Sign Oout
          </Button>
        </div>
      );
      break;
    default:
      internal = (
        <React.Fragment>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          { Array.isArray(responseError) && responseError.length > 0 && (
              <ul>
                {responseError?.map((err) => (<li key={err.key}>{err.message}</li>))}
              </ul>
            )
          }
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={handleEmail}
              value={userData.email}
              error={!isValidEmail}
              helperText={!isValidEmail && 'Invalid email'}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handlePassword}
              value={userData.password}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" checked={userData.remember} onChange={handleRemember} />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={submit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
            </Grid>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </React.Fragment>
      );
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          {internal}
        </div>
      </Grid>
    </Grid>
  );
}
