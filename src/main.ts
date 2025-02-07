import {DiceRoller} from "./blackjack/dice-roller.js";
import {Hand} from "./blackjack/hand.js"
import {Player} from "./blackjack/player.js"
import {BetBox} from "./blackjack/bet-box.js"
import * as Game from "./blackjack/card-game.js";

class BlackjackGame {
    die: DiceRoller = new DiceRoller(12345);
    MAX_HANDS: number = 4;
    MAX_BET_BOXES: number = 9;
    DECKS_PER_SHOE: number = 6;
    DECK_PENETRATION: number = 0.50;

    IS_EUROPEAN_NO_HOLE_CARD: boolean = true;
    IS_ALLOWED_SURRENDER: boolean = true;
    IS_ALLOWED_DOUBLE_AFTER_SPLIT: boolean = true;
    IS_ORIGINAL_BET_ONLY: boolean = true;

    shoe!: Game.Shoe;
    discard_pile: Game.Card[] = [];

    dealer!: Hand;
    players: Player[] = [];

    bet_boxes: BetBox[] = [];
    active_hands: Hand[] = [];
    

    constructor(){
        console.log("Seed: "+ this.die.getSeed);
        // Start the table
        this.dealer = new Hand(0);

        // -- Prepare the Shoe
        this.shoe = new Game.Shoe(this.DECKS_PER_SHOE);
        this.shoe.shuffle(this.die);
        // -- Burning Card
        this.discard_pile.push(this.shoe.draw()!);
        
        // -- Create the Bet Boxes
        for(let i=0; i<this.MAX_BET_BOXES;i++)
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


    public initialDealOut(): void{
        // Track Active Hands
        for (let betbox of this.bet_boxes)
            for (let hand of betbox.hands)
                this.active_hands.push(betbox.hands[0]);

        // Deal the Primary Card to Players
        for (let hand of this.active_hands)
            hand.hit(this.shoe.draw()!);

        // Deal the Primary Card to Dealer
        this.dealer.hit(this.shoe.draw()!);

        // Deal the Secondary Card to Players
        for (let hand of this.active_hands)
            hand.hit(this.shoe.draw()!);

        // Deal the Secondary Card to Dealer
        if (!this.IS_EUROPEAN_NO_HOLE_CARD) this.dealer.hit(this.shoe.draw()!);

        this.display();

    }
    
    public courseOfPlay() {
        
    }
    
    public payAndTake() {
        
    }

    public display(){
        // Update dealer hand
        const element_dealerHand = document.getElementById("dealer-hand");
        if (!element_dealerHand) return;

        // Creating Card Image
        element_dealerHand.appendChild(this.getCardImgElement(this.dealer.cards[0]));

        console.log();
        console.log("Dealer Hand: " + this.dealer.cards.map(card => card.toString(true)).join(" | "));
        for (let currentBetBox=0; currentBetBox<this.bet_boxes.length; currentBetBox++){
            let betbox:BetBox = this.bet_boxes[currentBetBox];
            if (betbox.player == null) continue;
            console.log("Box No. "+(currentBetBox+1)+": ");
            for (let currentHand=0; currentHand<betbox.hands.length; currentHand++){
                let hand:Hand = betbox.hands[currentHand];
                console.log("Hand No. "+(currentHand+1)+ ": Wager: $" + hand.bet + " Cards: " + hand.cards.map(card => card.toString(true)).join(" | "));
            }  
        }     
    }

    public getCardImgElement(card:Game.Card): HTMLElement{

        // Card Images Origin h: 240 w: 160
        let cards_path: string = "./assets/cards/"
        let img_type_file: string = ".png";

        
        const cardImg = document.createElement("img");
        cardImg.width = 60; //60
        cardImg.height = 90; //90
        cardImg.src = cards_path+card.toString(false)+img_type_file; 

        return cardImg;
    }
}






let game = new BlackjackGame();





