import React, { ReactElement } from 'react';
import {
  Collapse,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Grid
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { ErrorType, hasErrors } from '../globals/error-handling';
import keyGenerate from '../utils/string';

type severityType = 'info' | 'success' | 'warning' | 'error';

type AlertPropsType = {
  isOpen: boolean,
  severity: severityType,
  closeFn?: (...args: any) => any,
  title: string,
  body: string | string[] | ErrorType[]
}

type IconPropType = {
  severity: severityType,
  alertIcon: string
}

type useStylePropType = {
  severity: severityType
}

const useStyles =  makeStyles((theme: Theme) => createStyles({
  frame: {
    backgroundColor: (props: useStylePropType) => theme.palette[props.severity].light,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.common.black,
  },
  alertIcon: {
    color: (props: useStylePropType) => theme.palette[props.severity].dark
  }
}));

function IconBanner(props: IconPropType): ReactElement {
  switch(props.severity) {
    case 'error': return (<ErrorIcon className={props.alertIcon} />);
    case 'warning': return (<WarningIcon className={props.alertIcon} />);
    case 'info': return (<InfoIcon className={props.alertIcon} />);
    case 'success': return (<CheckCircleIcon className={props.alertIcon} />);
    default: return (<></>);
  }
}


function BannerAlert(props: AlertPropsType) {
  const {isOpen, severity, closeFn, title, body} = props;
  const classes = useStyles({severity});
  const bodyToShow = (typeof body === 'string')
    ? body
    : hasErrors(body)
      ? (
        <List dense={true}>
          { (body as ErrorType[]).map(err => (<ListItem key={err.key}><ListItemText primary={err.message} /></ListItem>)) }
        </List>
      ) : (body as string[]).map(phar => <Box key={keyGenerate(phar, 10)}>{phar}</Box>);

  return (
    <Collapse in={isOpen}>
      <Box className={classes.frame} m={2} p={1}>
        <Grid container>
          <Grid item xs={1}>
            <IconBanner severity={severity} alertIcon={classes.alertIcon} />
          </Grid>
          <Grid item xs={(typeof closeFn !== 'undefined') ? 10: 11}>
            <Typography variant="h4">{title}</Typography>
            {bodyToShow}
          </Grid>
          {
            (typeof closeFn !== 'undefined') && (
              <Grid item xs={1}>
                <IconButton onClick={closeFn} color="primary" aria-label="close">
                  <CloseIcon />
                </IconButton>
              </Grid>              
            ) 
          }
        </Grid>
      </Box>
    </Collapse> 
  )
}
/*
As of 2020-05-01, Alert is buggy
  <Alert
    action={
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={closeFn}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    }
  >
    <AlertTitle>User Saved Successfully</AlertTitle>
    Data of user was saved to database
  </Alert>
  */
export default BannerAlert;
