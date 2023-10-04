import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface visibility extends BaseDoc {
  status: "private" | "friends" | "public";
  from: ObjectId;
  to: ObjectId;
  friendGroup: Array<ObjectId>;
}

export default class VisibilityConcept {
  public readonly userFriends = new DocCollection<visibility>("userFriends");

  async removeFriend(user: ObjectId, userToRemove: ObjectId) {
    await this.isFriends(user, userToRemove);
    const friends = await this.userFriends.popOne({ $or: [{ user1: user, user2: userToRemove }] });

    if (friends === null) {
      throw new FriendNotFoundError(user, userToRemove);
    }
    return { msg: "Friend has been removed" };
  }

  async setAccess(author: ObjectId, status: String) {
    let postAccess: Array<visibility | ObjectId | String> = [];
    if (status === "private") {
      postAccess = [author];
    } else if (status === "friends") {
      postAccess = await this.userFriends.readMany({ $or: [{ author }] });
    } else {
      postAccess = ["all"];
    }
    return postAccess;
  }

  private async isFriends(u1: ObjectId, u2: ObjectId) {
    const friendship = await this.userFriends.readOne({
      $or: [
        { user1: u1, user2: u2 },
        { user1: u2, user2: u1 },
      ],
    });
    if (friendship === null || u1.toString() === u2.toString()) {
      throw new AlreadyConnected(u1, u2);
    }
  }
}

export class AlreadyConnected extends NotFoundError {
  constructor(
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("These users are already friends.", from, to);
  }
}

export class FriendNotFoundError extends NotFoundError {
  constructor(
    public readonly user1: ObjectId,
    public readonly user2: ObjectId,
  ) {
    super("Friendship between {0} and {1} does not exist!", user1, user2);
  }
}
