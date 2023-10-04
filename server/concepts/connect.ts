import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface ConnectRequest extends BaseDoc {
  from: ObjectId;
  to: ObjectId;
  fromGroup: Array<ObjectId>;
  toGroup: Array<ObjectId>;
  status: "pending" | "rejected" | "accepted";
}

export default class connectConcept {
  public readonly requests = new DocCollection<ConnectRequest>("friendRequests");
  public readonly fromGroup = new DocCollection<ConnectRequest>("fromFriends");
  public readonly toGroup = new DocCollection<ConnectRequest>("toFriends");

  async getRequests(user: ObjectId) {
    return await this.requests.readMany({
      $or: [{ from: user }, { to: user }],
    });
  }
  async acceptRequest(from: ObjectId, to: ObjectId) {
    await this.canSendRequest(from, to);
    await this.requests.createOne({ from, to, status: "accepted" });
    void this.fromGroup.createOne({ from, to });
    void this.toGroup.createOne({ to, from });
    return { msg: "Accepted request!" };
  }

  async sendRequest(from: ObjectId, to: ObjectId) {
    await this.canSendRequest(from, to);
    await this.requests.createOne({ from, to, status: "pending" });
    return { msg: "Sent request!" };
  }

  async rejectRequest(from: ObjectId, to: ObjectId) {
    await this.canSendRequest(from, to);
    await this.requests.createOne({ from, to, status: "rejected" });
    return { msg: "Rejected request!" };
  }

  private async canSendRequest(u1: ObjectId, u2: ObjectId) {
    await this.isNotFriends(u1, u2);
    // check if there is pending request between these users
    const request = await this.requests.readOne({
      from: { $in: [u1, u2] },
      to: { $in: [u1, u2] },
      status: "pending",
    });
    if (request !== null) {
      throw new ConnectRequestAlreadyExists(u1, u2);
    }
  }

  private async isNotFriends(u1: ObjectId, u2: ObjectId) {
    const friendship = await this.fromGroup.readOne({
      $or: [
        { user1: u1, user2: u2 },
        { user1: u2, user2: u1 },
      ],
    });
    if (friendship !== null || u1.toString() === u2.toString()) {
      throw new AlreadyConnected(u1, u2);
    }
  }
}

export class ConnectRequestNotFound extends NotFoundError {
  constructor(
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("Connect request from {0} to {1} does not exist!", from, to);
  }
}

export class ConnectRequestAlreadyExists extends NotFoundError {
  constructor(
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("Request to connect from {0} to {1} already exists!", from, to);
  }
}

export class AlreadyConnected extends NotFoundError {
  constructor(
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("These users are already connected.", from, to);
  }
}
