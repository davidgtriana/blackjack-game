import { Hand } from "./hand.js";
export class BetBox {
    constructor(id) {
        this.hands = [];
        this.id = id;
    }
    placeBet(bet) {
        this.hands.push(new Hand(bet));
        this.player.stack -= bet;
    }
}
