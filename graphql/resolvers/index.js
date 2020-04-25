const roleResolvers = require('./roles');
const userResolvers = require('./users');
const actionResolvers = require('./actions');

const resolvers = {
  ...roleResolvers,
  ...userResolvers,
  ...actionResolvers
}

module.exports = resolvers;