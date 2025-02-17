export class BetBox {
    id;
    player;
    hands = [];
    constructor(id) {
        this.id = id;
    }
    placeBet(bet) {
        this.hands[0].setBet(bet);
        this.player.stack -= bet;
    }
    print() {
        console.log("Printing BB" + this.id);
        this.hands.forEach(hand => hand.print());
    }
}
