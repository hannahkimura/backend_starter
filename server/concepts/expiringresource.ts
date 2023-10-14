import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";
export interface ExpiringDoc<T> extends BaseDoc {
  expDate: Date;
  expiring: T; //made it generic, but in my case this would be the stat
}

export default class ExpiringConcept<T> {
  public readonly expiringResources = new DocCollection<ExpiringDoc<T>>("expiringresources");

  async create(expiring: T, expDate: Date) {
    const _id = await this.expiringResources.createOne({ expiring, expDate });
    return { msg: "Resource successfully created!", resource: await this.expiringResources.readOne({ _id }) };
  }

  async getUnexpired(_id: ObjectId) {
    const resource = await this.expiringResources.readMany({ _id });
    const unexpired = [];
    if (!resource) {
      throw new ExpiringResourceNotFoundError(_id);
    }
    for (const item of resource) {
      const now = new Date();
      if (item.expDate > now) {
        unexpired.push(item);
      }
    }
    return unexpired;
  }
}
class ExpiringResourceNotFoundError extends NotFoundError {
  constructor(public readonly _id: ObjectId) {
    super("ExpiringResource was not found", _id);
  }
}
