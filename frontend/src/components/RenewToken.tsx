import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  Box,
  Button,
  Dialog ,
  DialogActions ,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@material-ui/core';
import { hasErrors } from '../globals/error-handling';
import BannerAlert from '../components/BannerAlert';
import { StateContext } from '../globals/context';
import { useRefreshToken } from '../utils/use-auth';
import { getRemaining } from '../utils/times';
import { useLogOut } from '../utils/use-auth';

type RenewTokenPropsType = {
}
type TimersType = {
  dialog: number,
  signout: number
}

export default function RenewToken(props: RenewTokenPropsType) {
  const { contextState } = useContext(StateContext);
  const {refreshErrors, refreshToken} = useRefreshToken();
  const [ completed, setCompleted ] = useState(0);
  const [ status, setStatus] = useState(() => {
    const remaining = getRemaining(contextState.expiration);
    return {show: 'hidden', remaining };
  });
  const {logOut} = useLogOut();
  const timers = useRef<TimersType>({dialog: 0, signout: 0});

  useEffect(() => {
    if (contextState.token.length > 3) {
      const remaining = getRemaining(contextState.expiration);
      timers.current.dialog = window.setTimeout(() => {
        setStatus({show: 'dialog', remaining: remaining - 25000});
      }, remaining - 25000);
      timers.current.signout = window.setTimeout(() => {
        setStatus({show: 'hidden', remaining: 0});
        logOut(true);
      }, remaining);
      return () => {
        clearTimers();
      }
    }
  }, [contextState.expiration, contextState.token, logOut]);

  useEffect(() => {
    function progress() {
      setCompleted((prevCompleted) => (prevCompleted >= 100 ? 0 : prevCompleted + 1));
    }
    if(status.show === 'dialog') {
      const timerProgress = setInterval(progress, 200);
      return () => {
        clearInterval(timerProgress);
      };
    }
  }, [status.show])

  async function handleContinue() {
    refreshToken(true);
    setStatus(prev => ({...prev, show:'hidden'})); 
  }

  function clearTimers() {
    clearTimeout(timers.current.dialog);
    clearTimeout(timers.current.signout);
  }

  function cancelSession() {
    // setStatus(prev => ({...prev, show:'hidden'}));
    clearTimers();
    logOut(true);
  }

  return (
    <>
      <Dialog
        open={status.show === 'dialog'}
        onClose={() => setStatus(prev => ({...prev, show:'hidden'}))}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Your sessiong is about to exipire'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tap on 'Continue' to keep your session opened
          </DialogContentText>
          <Box justifyContent="center" m={3}>
            <CircularProgress variant="static" value={completed} size="5rem" />            
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={cancelSession}
            color="secondary"
            variant="contained"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            variant="contained"
            color="primary" 
            autoFocus
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      <BannerAlert
        severity="error"
        isOpen={hasErrors(refreshErrors)}
        closeFn={() => setStatus(prev => ({...prev, show:'hidden'}))}
        title={`Error while trying to keep session opened. Please try to log in again`}
        body={refreshErrors || 'Server error'}
      />
    </>
  )
}