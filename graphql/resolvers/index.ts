const eventResolvers = require('./events');
const userResolvers = require('./users');
const bookingResolvers = require('./bookings');

const resolvers = {
  ...eventResolvers,
  ...userResolvers,
  ...bookingResolvers
}

export default resolvers;