import AlikeConcept from "./concepts/alike";
import FriendConcept from "./concepts/connect";
import PostConcept from "./concepts/post";
import SkillScoreConcept from "./concepts/skillscore";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Alike = new AlikeConcept();
export const SkillScore = new SkillScoreConcept();
