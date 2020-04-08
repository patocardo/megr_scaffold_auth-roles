import { Field, Int, Float, ObjectType } from "type-graphql";

@ObjectType
class EventType {
  @Field()
  _id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(type => Float)
  price: number;

  @Flied(type => UserType)
  creator: UserType;
}

export default EventType;