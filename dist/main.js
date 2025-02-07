import { DiceRoller } from "./dice-roller.js";
import * as Game from "./card-game.js";
class BlackjackGame {
    constructor() {
        this.die = new DiceRoller(12345);
        this.MAX_HANDS = 4;
        this.MAX_BET_BOXES = 9;
        this.DECKS_PER_SHOE = 6;
        this.DECK_PENETRATION = 0.50;
        this.IS_EUROPEAN_NO_HOLE_CARD = true;
        this.IS_ALLOWED_SURRENDER = true;
        this.IS_ALLOWED_DOUBLE_AFTER_SPLIT = true;
        this.IS_ORIGINAL_BET_ONLY = true;
        this.discard_pile = [];
        this.players = [];
        this.bet_boxes = [];
        this.active_hands = [];
        console.log("Seed: " + this.die.getSeed);
        // Start the table
        // -- Prepare the Shoe
        this.shoe = new Game.Shoe(this.DECKS_PER_SHOE);
        this.shoe.shuffle(this.die);
        // -- Burning Card
        this.discard_pile.push(this.shoe.draw());
        this.shoe.print();
        // -- Create the Bet Boxes
        for (let i = 0; i < this.MAX_BET_BOXES; i++)
            this.bet_boxes.push(new BetBox());
        // -- Sit the players
        this.players.push(new Player());
        this.bet_boxes[0].player = this.players[0];
        // Place your bets
        this.bet_boxes[0].placeBet(25);
        this.initialDealOut();
        this.courseOfPlay();
        this.payAndTake();
    }
    initialDealOut() {
        // Track Active Hands
        for (let betbox of this.bet_boxes)
            for (let hand of betbox.hands)
                this.active_hands.push(betbox.hands[0]);
        // Deal the Primary Card to Players
        for (let hand of this.active_hands)
            hand.hit(this.shoe.draw());
        // Deal the Primary Card to Dealer
        this.dealer = new Hand(0);
        this.dealer.hit(this.shoe.draw());
        // Deal the Secondary Card to Players
        for (let hand of this.active_hands)
            hand.hit(this.shoe.draw());
        // Deal the Secondary Card to Dealer
        if (!this.IS_EUROPEAN_NO_HOLE_CARD)
            this.dealer.hit(this.shoe.draw());
        this.display();
    }
    courseOfPlay() {
    }
    payAndTake() {
    }
    display() {
        console.log();
        console.log("Dealer Hand: " + this.dealer.cards.map(card => card.toString()).join(" | "));
        for (let currentBetBox = 0; currentBetBox < this.bet_boxes.length; currentBetBox++) {
            let betbox = this.bet_boxes[currentBetBox];
            if (betbox.player == null)
                continue;
            console.log("Box No. " + (currentBetBox + 1) + ": ");
            for (let currentHand = 0; currentHand < betbox.hands.length; currentHand++) {
                let hand = betbox.hands[currentHand];
                console.log("Hand No. " + (currentHand + 1) + ": Wager: $" + hand.bet + " Cards: " + hand.cards.map(card => card.toString()).join(" | "));
            }
        }
    }
}
class Player {
    constructor() {
        this.name = "David";
        this.stack = 0;
        this.stack = 1000;
    }
}
class Hand {
    constructor(bet) {
        this.cards = [];
        this.cards_value = 0;
        this.bet = 0;
        this.bet = bet;
    }
    hit(card) {
        this.cards.push(card);
        this.cards_value += card.value;
    }
    stand() { }
    double() { }
    split() { }
    surrender() { }
    insurance() { }
}
class BetBox {
    constructor() {
        this.hands = [];
    }
    placeBet(bet) {
        this.hands.push(new Hand(bet));
        this.player.stack -= bet;
    }
}
let game = new BlackjackGame();
