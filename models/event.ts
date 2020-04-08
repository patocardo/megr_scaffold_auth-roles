import { Document as mDocument, Schema as mSchema, model as mModel} from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { IUser } from './user';

export interface IEvent {
  title: string;
  description: string;
  price: number;
  date: Date;
  creator: IUser;
}

interface IEventModel extends IEvent, mDocument { }

const eventSchema = new mSchema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  creator: {
    type: mSchema.Types.ObjectId,
    ref: 'User',
    autopopulate: { select: '-password'}
  }
});
eventSchema.plugin(autopopulate);

const Event = mModel<IEventModel>('Event', eventSchema);

export default Event;

export interface IEventInput {
  title: string;
  description: string;
  price: number;
  date: Date;
  creator: {
    id: string
  };
}