import { DiceRoller } from "./blackjack/dice-roller.js";
import { Hand } from "./blackjack/hand.js";
import { Player } from "./blackjack/player.js";
import { BetBox } from "./blackjack/bet-box.js";
import * as Game from "./blackjack/card-game.js";
let DEBUG_MODE = true;
class BlackjackGame {
    constructor() {
        this.die = new DiceRoller(12345);
        this.MAX_HANDS = 4;
        this.MAX_BET_BOXES = 9;
        this.BET_BOXES_AMOUNT = 4;
        this.DECKS_PER_SHOE = 1;
        this.DECK_PENETRATION = 0.50;
        this.MAX_BET = 750;
        this.MIN_BET = 25;
        this.IS_EUROPEAN_NO_HOLE_CARD = true;
        this.IS_HIT_17 = true;
        this.IS_ALLOWED_SURRENDER = true;
        this.IS_ALLOWED_DOUBLE_AFTER_SPLIT = true;
        this.IS_ORIGINAL_BET_ONLY = true;
        this.players = [];
        this.bet_boxes = [];
        this.active_hands = [];
        // Start the table
        this.initializeTable();
        // Start New Shoe
        this.startNewShoe();
        // Sit the players
        this.seatPlayers();
        this.initialDealOut();
        this.courseOfPlay();
        this.payAndTake();
    }
    initializeTable() {
        // Creates Objects
        this.dealerHand = new Hand(0, 0, 0);
        this.discard_pile = new Game.StackCard(0);
        // -- Create the Bet Boxes
        for (let i = 0; i < this.BET_BOXES_AMOUNT; i++)
            this.bet_boxes.push(new BetBox(i + 1));
        // Instantiate Bet Boxes HTML Elements
        const element_bet_boxes_area = document.getElementById("bet-boxes-area");
        for (let currentBetBox = 0; currentBetBox < this.BET_BOXES_AMOUNT; currentBetBox++) {
            const betbox = this.bet_boxes[currentBetBox];
            const element_betbox = document.createElement("div");
            element_betbox.className = "bet-box";
            element_betbox.id = "bet-box-" + betbox.id;
            element_bet_boxes_area.append(element_betbox);
        }
    }
    startNewShoe() {
        // -- Prepare the Shoe
        this.shoe = new Game.StackCard(this.DECKS_PER_SHOE);
        this.shoe.shuffle(this.die);
        // -- Burning Card
        this.discard_pile.add(this.shoe.draw());
    }
    seatPlayers() {
        // Create Players
        this.players.push(new Player("Juan"));
        this.players.push(new Player("David"));
        this.players.push(new Player("Godoy"));
        this.players.push(new Player("Triana"));
        // Assigning a player per Bet Box
        for (let i = 0; i < 4; i++) {
            //if (i==2) continue;
            this.bet_boxes[i].player = this.players[i];
        }
        // Place Player Bets
        for (let i = 0; i < 4; i++) {
            //if (i==2) continue;
            this.bet_boxes[i].placeBet(25); // Creates the first Hand of this bet box
        }
    }
    initialDealOut() {
        // Track Active Hands and Instantiate HTML Elements for Active Hands
        for (let betbox of this.bet_boxes) {
            if (betbox.player == null)
                continue;
            const element_betbox = document.getElementById("bet-box-" + betbox.id);
            // Displaying Hand Element Per Bet Box
            for (let currentHand = 0; currentHand < betbox.hands.length; currentHand++) {
                const hand = betbox.hands[currentHand];
                this.active_hands.push(hand);
                const element_hand = document.createElement("div");
                element_hand.className = "hand" + " hand-" + (currentHand + 1);
                element_betbox.appendChild(element_hand);
                // Initialize Element of the Hand
                const element_hand_value = document.createElement("div");
                element_hand_value.className = "value";
                element_hand_value.append(hand.getHandValue());
                element_hand.appendChild(element_hand_value);
                const element_hand_bet = document.createElement("div");
                element_hand_bet.className = "bet";
                element_hand_bet.append(hand.bet.toString());
                element_hand.appendChild(element_hand_bet);
            }
        }
        // Deal the Primary Card to Players
        for (let hand of this.active_hands)
            this.hitHand(hand, this.shoe.draw());
        // Deal the Primary Card to Dealer
        this.hitHand(this.dealerHand, this.shoe.draw(), "dealer");
        // Deal the Secondary Card to Players
        for (let hand of this.active_hands)
            this.hitHand(hand, this.shoe.draw());
        // Deal the Secondary Card to Dealer
        //if (!this.IS_EUROPEAN_NO_HOLE_CARD) this.dealerHand.hit(this.shoe.draw()!);
        if (DEBUG_MODE)
            this.displayConsole();
    }
    hitHand(hand, card, entity = "player") {
        hand.hit(card);
        const card_id = hand.cards.length - 1;
        const element_card = this.createCardImgElement(card, card_id + 1);
        let element_area = entity === "dealer"
            ? document.getElementById("dealer-area") : document.getElementById(`bet-box-${hand.betbox_id}`);
        if (!element_area)
            return;
        // Update Hand Value
        const element_value = element_area.querySelector(".value");
        if (element_value)
            element_value.textContent = hand.getHandValue();
        // Add Card Element
        //const element_hand = element_area.querySelector(`.hand${entity === "player" ? `-` + hand.id : ``}`);
        const element_hand = element_area.querySelector(".hand" + (entity == "player" ? "-" + hand.id.toString() : ""));
        if (element_hand) {
            const top_offset = 90;
            element_card.style.top = `${-top_offset + card_id * -30}px`;
            element_card.style.left = `${card_id * 35}px`;
            element_hand.appendChild(element_card);
        }
    }
    courseOfPlay() {
        // Iterate through each active hand and ask them what they want to do
    }
    payAndTake() {
    }
    displayConsole() {
        console.log("Seed: " + this.die.getSeed());
        // Displaying Dealer's hand in the console
        console.log("Dealer Hand: ");
        this.dealerHand.print();
        // Printing Players' Hands in the console
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
    createCardImgElement(card, id) {
        // Card Images Origin h: 240 w: 160
        let cards_path = "./assets/cards/";
        let img_type_file = ".png";
        const cardImg = document.createElement("img");
        cardImg.className = "card card-" + id;
        cardImg.src = cards_path + card.toString(false) + img_type_file;
        return cardImg;
    }
}
let game = new BlackjackGame();
