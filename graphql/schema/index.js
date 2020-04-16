const graphql = require('graphql');

const schema = graphql.buildSchema(`
  type Booking {
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
    creator: User!
  }

  input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!
  }

  type User {
    _id: ID!
    email: String!
    password: String
    createdEvents: [Event!]
  }

  type AuthData {
    userId: ID!
    token: String!
    expiration: Int!
  }

  type AuthBackData {
    email: String!
  }

  type SuccessData {
    success: String!
  }

  input UserInput {
    email: String!
    password: String
  }

  type RootQuery {
    events: [Event!]!
    users: [User!]!
    bookings: [Booking!]!
    login(email: String!, password: String!, remember: Boolean): AuthData
    tokenIsAlive(token: String!): AuthBackData
  }

  type RootMutation {
    createEvent(eventInput: EventInput): Event
    createUser(userInput: UserInput): User
    bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

module.exports = schema;