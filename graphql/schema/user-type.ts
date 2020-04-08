import { Field, Int, Float, ObjectType } from "type-graphql";

@ObjectType
class UserType {
  @Field()
  _id: string;

  @Field()
  email: string;

  @Field()
  password: string;
}