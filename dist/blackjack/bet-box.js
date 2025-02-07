import { Hand } from "./hand.js";
export class BetBox {
    constructor() {
        this.hands = [];
    }
    placeBet(bet) {
        this.hands.push(new Hand(bet));
        this.player.stack -= bet;
    }
}
