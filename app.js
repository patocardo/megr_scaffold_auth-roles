require('dotenv').config();

const express= require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');

const isAuth = require('./middleware/is-auth');
const validateEnv = require('./helpers/validate-env');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

validateEnv();
mongoose.set('useCreateIndex', true);
mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}` +
  `@cluster0-7czxt.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  app.listen(process.env.PORT);
}).catch((err) => console.error(err));

const app = express();

app.use(bodyParser.json());

app.use(cors());

app.get('/', (req, res, next) => {
  res.send('Hola tipo');
});

app.use(isAuth);

const extensions = ({ context }) => {
  return {
    newToken: context.newToken,
  };
};

app.use('/graphql', graphqlHttp({
  schema: schema,
  rootValue: resolvers,
  graphiql: true,
  extensions: extensions
}));
