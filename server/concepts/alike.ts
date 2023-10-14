import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

//this syncs with profiles 

export interface AlikeDoc extends BaseDoc {
  user: ObjectId;
  genderPref: ObjectId;
  sportsPref: Map<ObjectId, boolean>;
  skillPref: Array<ObjectId>; //range of skillscores that are okay
  locationRange: Number;
}

export default class AlikeConcept {

    public readonly preferences= new DocCollection<AlikeDoc>("preferences");

    

}