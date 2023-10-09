import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

export interface ProfileInfoDoc extends BaseDoc {
  user: ObjectId;
  gender: ObjectId;
  sports: Map<String, boolean>;
  skill: Number;
  location: ObjectId;
  //when do i use objectid vs string
}

export default class ProfileConcept {}
