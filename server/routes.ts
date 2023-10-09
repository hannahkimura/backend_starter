import { ObjectId } from "mongodb";

import { Friend, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { Router, getExpressRouter } from "./framework/router";

import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(session: WebSessionDoc, author?: string) {
    let posts;
    const postsToReturn: Array<PostDoc> = [];
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
      const otherUser = session.user;
      if (!otherUser) {
        throw new Error("can't find other user");
      }
      const otherId = (await User.getUserByUsername(otherUser))._id;
      const areNotFriends = Friend.isNotFriends(id, otherId);

      if (id.toString() === otherId.toString()) {
        //author is the same as user
        return Responses.posts(posts);
      } else if (!areNotFriends) {
        //this is the case where they are friends
        //show all posts with state of friends
        for (const post of posts) {
          if (post.visibility == "friends" || post.visibility == "public") {
            postsToReturn.push(post);
          }
        }
      } else {
        //users are not friends
        for (const post of posts) {
          if (post.visibility == "public") {
            postsToReturn.push(post);
          }
        }
        //show all posts with state of public
      }
    } else {
      //author doesn't exist
      posts = await Post.getPosts({});
    }

    return Responses.posts(postsToReturn);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    //How do i add pics to this?
    //need to post this to feed and to profile (how do I do this)
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/connect/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Connect.getRequests(user));
  }

  @Router.post("/connect/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Connect.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/connect/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Connect.acceptRequest(fromId, user);
  }

  @Router.put("/connect/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Connect.rejectRequest(fromId, user);
  }

  //Outlines:

  // @Router.put("/profile/update")
  // async updateInfo(profile_info: Map<String,Number|String>,current_posts:Array<PostDoc>) {

  // }

  // @Router.put("/profile/delete")
  // async deleteProfile(current_posts:Array<PostDoc>) {

  // }

  // @Router.post("profile/reveal")
  // async revealProfile(current_posts:Array<PostDoc>) {

  // }

  // @Router.post("alike/preferences")
  // async updatePref(preferences: Array<Map<String,String| SkillScore>>) {

  // }

  // @Router.post("alike/filter")
  // async filter(preferences:Array<Map<String,String| SkillScore>>,recommended_users: Array<ObjectId>) {

  // }

  // @Router.post("skillscore/score")
  // async addScore(current: Number, opponent: Number, score: Array<Number, Number>, valid_scores: Array<Number>) {}

  // @Router.delete("skillscore/score/delete")
  // async removeScore(current:Number,scores: Array<Number,Number>,valid_scores: Array<Number>) {

  // }

  // @Router.post("expiringresource/addedScore")
  // async allocate(r:ObjectId,t:Number) {}

  // @Router.delete("expiringresource/expiredScore")
  // async expire(r:ObjectId) {}
}

export default getExpressRouter(new Routes());
