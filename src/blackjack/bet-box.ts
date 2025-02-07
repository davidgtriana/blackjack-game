import {Hand} from "./hand.js"
import {Player} from "./player.js"

export class BetBox{
    player!: Player;
    hands: Hand[] = [];

    constructor(){}

    public placeBet(bet: number){
        this.hands.push(new Hand(bet));
        this.player.stack -= bet;
    }
}
