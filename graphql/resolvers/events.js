const Event = require('../../models/event');
const User = require('../../models/user');

const eventResolvers = {
  events: () => Event.find(),
  eventById: (args) => Event.findById(args.id),
  createEvent: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const event = new Event({
        ...args.eventInput,
        date: new Date(args.eventInput.date),
        creator: req.userId
      });
      const createdEvent = await event.save();
      const existingUser = await User.findById(req.userId);
      if(!existingUser) throw new Error('creator user did not exists.');
      existingUser.createdEvents.push(event);
      const savedUser = await existingUser.save();
      return createdEvent;
    } catch(err) {
      throw err;
    }
  }
};

module.exports = eventResolvers;
