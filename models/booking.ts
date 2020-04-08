import { Document as mDocument, Schema as mSchema, model as mModel} from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { IUser } from './user';
import { IEvent } from './event';

export interface IBooking {
  event: IEvent;
  user: IUser;
}

interface IBookingModel extends IBooking, mDocument { }

const bookingSchema = new mSchema({
  event: {
    type: mSchema.Types.ObjectId,
    ref: 'Event',
    autopopulate: true
  },
  user: {
    type: mSchema.Types.ObjectId,
    ref: 'User',
    autopopulate: { select: '-password'}
  },
}, {timestamps: true});
bookingSchema.plugin(autopopulate);


const Booking = mModel<IBookingModel>('Booking', bookingSchema);

export default Booking;

export interface IBookingInput {
  event: {
    id: string
  };
  user: {
    id: string
  };
}