const graphql = require('graphql');

const schema = graphql.buildSchema(`
  type Role {
    _id: ID!
    name: String!
    description: String
  }

  type Action {
    _id: ID!
    title: String!
    context: String
    roles: [Role!]
  }

  input RoleInput {
    name: String!
    description: String!
  }

  input ActionInput {
    title: String!
    context: String
    roles: [String!]
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
    actions: [Action!]!
    users(search: String, role: String): [User!]
    login(email: String!, password: String!, remember: Boolean): AuthData
    tokenIsAlive(token: String!): AuthBackData
  }

  type RootMutation {
    createRole(roleInput: RoleInput): Role
    updateRole(id: String!, roleInput: RoleInput): Role
    removeRoles(ids: [String!]!): Boolean
    createAction(actionInput: ActionInput): Action
    updateAction(id: String!, actionInput: ActionInput): Action
    removeActions(ids: [String!]!): Boolean
    createUser(userInput: UserInput): User
    updateUser(id: String!, userInput: UserInput): User
    removeUsers(ids: String!): Boolean
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

module.exports = schema;