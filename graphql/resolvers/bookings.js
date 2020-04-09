const Event = require('../../models/event');
const Booking = require('../../models/booking');

const bookingResolvers = {
  bookings: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error('not authenticated.');
      return await Booking.find();
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
      return await booking.save();
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