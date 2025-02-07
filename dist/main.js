import { DiceRoller } from "./blackjack/dice-roller.js";
import { Hand } from "./blackjack/hand.js";
import { Player } from "./blackjack/player.js";
import { BetBox } from "./blackjack/bet-box.js";
import * as Game from "./blackjack/card-game.js";
class BlackjackGame {
    constructor() {
        this.die = new DiceRoller(12345);
        this.MAX_HANDS = 4;
        this.MAX_BET_BOXES = 9;
        this.DECKS_PER_SHOE = 6;
        this.DECK_PENETRATION = 0.50;
        this.MIN_BET = 25;
        this.MAX_BET = 750;
        this.IS_EUROPEAN_NO_HOLE_CARD = true;
        this.IS_ALLOWED_SURRENDER = true;
        this.IS_ALLOWED_DOUBLE_AFTER_SPLIT = true;
        this.IS_ORIGINAL_BET_ONLY = true;
        this.players = [];
        this.bet_boxes = [];
        this.active_hands = [];
        console.log("Seed: " + this.die.getSeed);
        // Start the table
        this.dealerHand = new Hand(0);
        this.discard_pile = new Game.StackCard(0);
        // -- Prepare the Shoe
        this.shoe = new Game.StackCard(this.DECKS_PER_SHOE);
        this.shoe.shuffle(this.die);
        // -- Burning Card
        this.discard_pile.add(this.shoe.draw());
        // -- Create the Bet Boxes
        for (let i = 0; i < this.MAX_BET_BOXES; i++)
            this.bet_boxes.push(new BetBox());
        // -- Sit the players
        this.players.push(new Player("Juan"));
        this.players.push(new Player("David"));
        this.bet_boxes[0].player = this.players[0];
        this.bet_boxes[1].player = this.players[1];
        // Place your bets
        this.bet_boxes[0].placeBet(25);
        this.bet_boxes[1].placeBet(25);
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
        this.dealerHand.hit(this.shoe.draw());
        // Deal the Secondary Card to Players
        for (let hand of this.active_hands)
            hand.hit(this.shoe.draw());
        // Deal the Secondary Card to Dealer
        if (!this.IS_EUROPEAN_NO_HOLE_CARD)
            this.dealerHand.hit(this.shoe.draw());
        this.shoe.print();
        this.display();
    }
    courseOfPlay() {
    }
    payAndTake() {
    }
    display() {
        // Update dealer hand
        const element_dealerHand = document.getElementById("dealer-hand");
        if (!element_dealerHand)
            return;
        // Creating Card Image
        element_dealerHand.appendChild(this.getCardImgElement(this.dealerHand.cards[0]));
        console.log("Dealer Hand: ");
        this.dealerHand.print();
        for (let currentBetBox = 0; currentBetBox < this.bet_boxes.length; currentBetBox++) {
            let betbox = this.bet_boxes[currentBetBox];
            if (betbox.player == null)
                continue;
            console.log("Box No. " + (currentBetBox + 1) + ": Player: " + betbox.player.name);
            for (let currentHand = 0; currentHand < betbox.hands.length; currentHand++) {
                let hand = betbox.hands[currentHand];
                hand.print(currentHand + 1);
            }
        }
    }
    getCardImgElement(card) {
        // Card Images Origin h: 240 w: 160
        let cards_path = "./assets/cards/";
        let img_type_file = ".png";
        const cardImg = document.createElement("img");
        cardImg.width = 60; //60
        cardImg.height = 90; //90
        cardImg.src = cards_path + card.toString(false) + img_type_file;
        return cardImg;
    }
}
let game = new BlackjackGame();
