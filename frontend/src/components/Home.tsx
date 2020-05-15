import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CssBaseline,
  Grid,
  Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="http://www.codigitar.com/">
        Yet another skeleton
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

const cards = [
  { 
    cardId: 'mongo',
    heading: 'Mongo DB', 
    Body: () => (<>Managed with Mongoose. This example locates the data on 
      &nbsp;<a href="https://www.mongodb.com/">Mongodb.live</a></>)
  },
  { 
    cardId: 'express',
    heading: 'ExpressJs', 
    Body: () => (<>Back-en developed in NodeJS with ExpressJs</>)
  },
  { 
    cardId: 'graphql',
    heading: 'GraphQL', 
    Body: () => (<>The 'Be4Fe' act as link for every front-end requests, it uses graphqlHttp to link to ExpressJs
      <br/>Resolvers are the base of actions to authorize for roles</>)
  },
  { 
    cardId: 'react',
    heading: 'React', 
    Body: () => (<>The site scheme is Single Page Application, and it is developed under React
      <br/>Hooks are extensively used</>)
  },
  { 
    cardId: 'typescript',
    heading: 'Typescript', 
    Body: () => (<>The front-end uses Typescript</>)
  },
  { 
    cardId: 'material',
    heading: 'Material-UI', 
    Body: () => (<>The User Interface is beautified with the Material-UI, and uses some of its templates
      <br/>Components of 'labs' create some conflicts, so there where developed some replacements</>)
  },

];

export default function Album() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <CssBaseline />
      <main>
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Web app skeleton
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              This is a scaffolding aimed to be the base for the development of web applications.
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Just Authentication and Authorization functionalities are integrated.
            </Typography>
          </Container>
        </div>
        <Container className={classes.cardGrid} maxWidth="md">
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item key={card.cardId} xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardMedia
                    className={classes.cardMedia}
                    image="https://picsum.photos/seed/picsum/200/300"
                    title="Random image"
                  />
                  <CardContent className={classes.cardContent}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {card.heading}
                    </Typography>
                    <Typography>
                      <card.Body />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>
          Made by Codigitar
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          This is developed for boilerplates
        </Typography>
        <Copyright />
      </footer>
      {/* End footer */}
    </React.Fragment>
  );
}