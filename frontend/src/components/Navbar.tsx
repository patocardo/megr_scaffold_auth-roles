import React, { useContext, useState, useEffect } from 'react';
import clsx from 'clsx';
import { NavLink, useHistory } from 'react-router-dom';
import { AppBar, Toolbar, Typography, CssBaseline, useScrollTrigger, Button, IconButton,
  Drawer, List, ListItem, ListItemText } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useLogOut } from '../utils/use-auth';

import { StateContext } from '../globals/context';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    navlink: {
      textDecoration: 'none'
    },
    buttonRoot: {
      color: 'white',
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      }
    },
    root: {
      flexGrow: 1,
      [theme.breakpoints.up('sm')]: {
        textAlign: 'left',
      }
    },
    topMenu: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      }
    },
    title: {
      flexGrow: 1,
    },
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    }
  }),
);

interface ElevationScrollProps {
  window?: () => Window,
  children?: React.ReactElement
}

function ElevationScroll(props: ElevationScrollProps) {
  const { children, window } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });
  if (!children) {
    return (<></>);
  }
  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

const outTargets = [{label:'Login', key: 'login'}];

export default function NavBar(props: ElevationScrollProps) {
  const classes = useStyles();
  const { contextState } = useContext(StateContext);
  const [isOpen, setIsOpen] = useState(false);
  const [targets, setTargets] = useState(outTargets);
  const history = useHistory();
  const {logOut} = useLogOut();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ['Tab', 'Shift'].includes((event as React.KeyboardEvent).key)
    ) {
      return;
    }
    setIsOpen(open);
  }

  function signOut() {
    logOut(true);
    history.push('/');
  }
 
  useEffect(() => {
    setTargets(contextState.token.length > 3
      ? [{label: 'Home', key:''}, {label: 'Users', key: 'users'}, {label: 'Roles', key: 'roles'}]
      : outTargets
    );
  }, [contextState.token]);

  return (
    <React.Fragment>
      <CssBaseline />
      <ElevationScroll {...props}>
        <AppBar className={classes.root}>
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"  onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>Auth-Auth</Typography>
            <div className={classes.topMenu}>
              {targets.map((elm) =>
                (
                  <NavLink to={`/${elm.key}`} key={elm.label} className={classes.navlink}>
                    <Button color="primary" classes={{
                      root: classes.buttonRoot
                    }}>{elm.label}</Button>
                  </NavLink>
                ))
              }
              {
                 contextState.token.length > 3 && (
                  <Button
                    color="primary" 
                    classes={{ root: classes.buttonRoot }}
                    onClick={signOut}
                  >
                    Log Out
                  </Button>                  
                )
              }
            </div>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Drawer anchor='left' open={isOpen} onClose={toggleDrawer(false)}>
        <div
          className={clsx(classes.list)}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {targets.map((elm, index) => (
              <NavLink to={`/${elm.key}`} key={elm.key} className={classes.navlink}>
                <ListItem button>
                  <ListItemText primary={elm.label} />
                </ListItem>
              </NavLink>
            ))}
          </List>
        </div>
      </Drawer>
    </React.Fragment>
  );
}
