const graphql = require('graphql');

const schema = graphql.buildSchema(`
  type Role {
    _id: ID!
    name: String!
    description: String
    resolvers: [String!]
  }

  input RoleInput {
    name: String!
    description: String!
    resolvers: [String!]
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    roles: [Role!]
  }

  type AuthData {
    userId: ID!
    token: String!
    expiration: Float!
  }

  type AuthBackData {
    email: String!
    remember: Boolean!
    exp: Int!
    iat: Int!
    userId: ID!
    expiration: Float!
  }

  input UserInput {
    name: String!
    email: String!
    password: String
    roles: [String!]!
  }

  type RootQuery {
    roles(search: String): [Role!]!
    roleById(id: String): Role!
    resolvers: [String!]!
    users(search: String, role: String): [User!]
    userById(id: String): User
    login(email: String!, password: String!, remember: Boolean): AuthData
    tokenIsAlive(token: String!): AuthBackData
    refreshToken(token: String!): AuthData
  }

  type RootMutation {
    roleCreate(roleInput: RoleInput): Role
    roleUpdate(id: String!, roleInput: RoleInput): Role
    rolesRemove(ids: [String!]!): Int
    userCreate(userInput: UserInput): User
    userUpdate(id: String!, userInput: UserInput): User
    usersRemove(ids: [String!]): Int
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

module.exports = schema;