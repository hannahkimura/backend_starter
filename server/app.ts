import connectConcept from "./concepts/connect";
import FriendConcept from "./concepts/friend";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import VisibilityConcept from "./concepts/visibility";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Visibility = new VisibilityConcept();
export const Connect = new connectConcept();
