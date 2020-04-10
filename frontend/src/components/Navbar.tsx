import React from 'react';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, CssBaseline, useScrollTrigger, Button, IconButton,
Drawer, List, ListItem, ListItemText } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const targets = ['Users', 'Bookings', 'Events', 'Login'];

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

/*
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      }
 */

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

export default function NavBar(props: ElevationScrollProps) {
  const { children } = props;
  const classes = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ['Tab', 'Shift'].includes((event as React.KeyboardEvent).key)
    ) {
      return;
    }

    setIsOpen(open);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <ElevationScroll {...props}>
        <AppBar className={classes.root}>
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
              <MenuIcon onClick={toggleDrawer(true)}/>
            </IconButton>
            <Typography variant="h6" className={classes.title}>User-Event booking</Typography>
            <div className={classes.topMenu}>
              {targets.map((elm) =>
                (
                  <NavLink to={`/${elm.toLowerCase()}`} key={elm} className={classes.navlink}>
                    <Button color="primary" classes={{
                      root: classes.buttonRoot
                    }}>{elm}</Button>
                  </NavLink>
                ))
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
              <NavLink to={`/${elm.toLowerCase()}`} key={elm} className={classes.navlink}>
                <ListItem button key={elm}>
                  <ListItemText primary={elm} />
                </ListItem>
              </NavLink>
            ))}
          </List>
        </div>
      </Drawer>
    </React.Fragment>
  );
}
