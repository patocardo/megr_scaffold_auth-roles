require('dotenv').config();

import express, { Request, Response } from "express";
const bodyParser = require ('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');

import validateEnv from './helpers/validateEnv';
import schema from './graphql/schema/index';
import resolvers from './graphql/resolvers/index';
import isAuth from './middleware/is-auth';

validateEnv();

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}` +
  `@cluster0-7czxt.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  app.listen(process.env.PORT);
}).catch((err: any) => console.error(err));

const app = express();

app.use(bodyParser.json());

app.use(cors());

app.get('/', (req: Request, res: Response, next: any) => {
  res.send('Hola tipo');
});

app.use(isAuth);

app.use('/graphql', graphqlHttp({
  schema: schema,
  rootValue: resolvers,
  graphiql: true
}));

