import { Request } from "express";
import Event, { IEvent, IEventInput } from '../../models/event';
import User from '../../models/user';
import { IdInterface, RequestWithAuth } from '../../helpers/global-interfaces';

const eventResolvers = {
  events: () => Event.find(),
  eventById: (args: IdInterface) => Event.findById(args.id),
  createEvent: async (args: {eventInput: IEventInput}, req: RequestWithAuth) => {
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

export default eventResolvers;