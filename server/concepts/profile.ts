import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface ProfileInfoDoc extends BaseDoc {
  user: ObjectId;
  gender: ObjectId;
  sports: Map<ObjectId, boolean>;
  skill: Array<ObjectId>; //should this be an objectId
  location: ObjectId;
  //when do i use objectid vs number
}
//how do i get my posts connected to this?
export default class ProfileConcept {
  public readonly profiles = new DocCollection<ProfileInfoDoc>("profiles");

  async getProfiles(query: Filter<ProfileInfoDoc>) {
    const profiles = await this.profiles.readMany(query, {
      sort: { dateUpdated: -1 }, //don't get this
    });
    return profiles;
  }

  async getProfileByAuthor(author:ObjectId) {
    return await this.getProfiles({ author });
  }

}


