import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface SkillScoreDoc extends BaseDoc {
    score:Number;
    user1:ObjectId;
    user2:ObjectId;
  }

  export default class SkillScoreConcept {
    public readonly userScores= new DocCollection<SkillScoreDoc>("skillScores");

    // async getScore()

    // async updateScore(user:ObjectId,newResult:Map<String,ObjectId>) {
    //     //new result is a dict that maps the result "win or lose" to the other user.
    //     //depending on the other user's score, user's score will go up or down
    //     //if user wins and doens't yet have a skillscore,they become one skill score higher than the other user
        
    // }
  } 