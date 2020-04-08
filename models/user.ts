import { Document as mDocument, Schema as mSchema, model as mModel} from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { IEvent } from './event';

export interface IUser {
  email: string;
  password: string;
  createdEvents: IEvent[];
  _doc: any;
}

interface IUserModel extends IUser, mDocument { }

const userSchema = new mSchema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdEvents: [
    {
      type: mSchema.Types.ObjectId,
      ref: 'Event',
      autopopulate: true
    }
  ]
});
userSchema.plugin(autopopulate);

const User = mModel<IUserModel>('User', userSchema);

export default User;

export interface IUserInput {
  email: string;
  password: string;
}