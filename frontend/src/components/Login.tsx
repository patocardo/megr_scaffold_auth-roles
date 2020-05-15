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
import PasswordInput from './PasswordInput';
import { StateContext } from '../globals/context';
import { BannerError } from '../globals/error-handling';
import useLogIn, { useLogOut } from '../utils/use-auth';
import { getRemaining } from '../utils/times';

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
  const [status, setStatus] = useState<'in'|'out'|'submit'|'leaving'>('out');
  const [userData, setUserData] = useState({ email: '', password: '', remember: false });
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const { contextState } = useContext(StateContext);
  const { loginErrors, logIn } = useLogIn();
  const {logOutErrors, logOut} = useLogOut();
  const classes = useStyles();
  let internal = (<div></div>);

  useEffect(() => {
    const situation = (
      contextState.token.length > 3 &&
      getRemaining(contextState.expiration) > 0
    ) ? 'in' : 'out';
    setStatus(situation);
  }, [contextState.token, contextState.expiration]);

  function handleEmail(evt: React.ChangeEvent<HTMLInputElement>) {
    const email = evt.target.value;
    setIsValidEmail(validate(email));
    setUserData({ ...userData, email });
  }
  function handlePassword(password: string, isValid: boolean) {
    setIsValidPassword(!isValid);
    setUserData({ ...userData, password });
  }
  function handleRemember(evt: React.ChangeEvent<HTMLInputElement>) {
    setUserData({ ...userData, remember: evt.target.checked });
  }

  function submit(evt: React.MouseEvent) {
    evt.preventDefault();
    if (isValidEmail && true /* isValidPassword */) {
      setStatus('submit');
      logIn(userData);
    }
  }

  function toLogout(evt: React.MouseEvent) {
    evt.preventDefault();
    setStatus('leaving');
    logOut(true);
  }

  switch (status) {
    case 'submit':
      internal = (
        <div>
          <Box display="flex" justifyContent="center">
            <CircularProgress size={80}/>
          </Box>  
          <Typography component="h1" variant="h5" align="center">
            Sending user&#39;s data
          </Typography>
        </div>
      );
      break;
    case 'in':
      internal = (
        <div>
          <Typography component="h1" variant="h5">
            Welcome
          </Typography>
          <Typography component="h1" variant="h4">
            { contextState.email }
          </Typography>
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={toLogout}
          >
            Sign Out
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
          <BannerError
            message={`Error while trying to log`}
            errors={[loginErrors, logOutErrors]}
          />
          <form className={classes.form} noValidate>
            <TextField
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
            <PasswordInput
              fieldId={'pass_login'}
              onChange={handlePassword}
              validation="none"
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
