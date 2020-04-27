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
    expiration: Int!
  }

  type AuthBackData {
    email: String!
  }

  type SuccessData {
    success: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String
    roles: [String!]!
  }

  type RootQuery {
    roles: [Role!]!
    resolvers: [String!]!
    users(search: String, role: String): [User!]
    login(email: String!, password: String!, remember: Boolean): AuthData
    tokenIsAlive(token: String!): AuthBackData
  }

  type RootMutation {
    roleCreate(roleInput: RoleInput): Role
    roleUpdate(id: String!, roleInput: RoleInput): Role
    rolesRemove(ids: [String!]!): Boolean
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