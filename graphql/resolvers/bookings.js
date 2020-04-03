const Event = require('../../models/event');
const Booking = require('../../models/booking');

const parsedTimestamps = (model) => ({
  createdAt: (new Date(model._doc.createdAt)).toISOString(),
  updatedAt: (new Date(model._doc.updatedAt)).toISOString()
});

const bookingResolvers = {
  bookings: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          ...parsedTimestamps(booking)
        }
      })
    } catch(err) {
      throw err;
    }
  },
  bookEvent: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const existingEvent = await Event.findById(args.eventId);
      if(!existingEvent) throw new Error('unexistent event');
      const booking = new Booking({
        user: req.userId,
        event: existingEvent
      });
      const result = await booking.save();
      return {
        ...result._doc,
        ...parsedTimestamps(result)
      }
    } catch(err) {
      throw err;
    }
  },
  cancelBooking: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      const existingBooking = await Booking.findById(args.bookingId);
      if(!existingBooking) throw new Error('unexistent booking');
      const evt = existingBooking.event;
      const deleted = Booking.deleteOne({_id: args.bookingId});
      return evt;
    } catch(err) {
      throw err;
    }
  }
}

module.exports = bookingResolvers;