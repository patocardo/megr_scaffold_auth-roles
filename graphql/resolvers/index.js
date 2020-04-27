const roleResolvers = require('./roles');
const userResolvers = require('./users');
const authResolvers = require('./auths');

const resolvers = {
  ...roleResolvers,
  ...userResolvers,
  ...authResolvers
}

module.exports = resolvers;