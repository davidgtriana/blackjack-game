
import * as Game from "./card-game.js";

class BlackjackGame {
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
        // Start the table
        // -- Prepare the Shoe
        this.shoe = new Game.Shoe(this.DECKS_PER_SHOE);
        this.shoe.shuffle();
        // -- Burning Card
        this.discard_pile.push(this.shoe.draw()!);
        this.shoe.print();

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
        this.dealer = new Hand(0);
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
        console.log();
        console.log("Dealer Hand: " + this.dealer.cards.map(card => card.toString()).join(" | "));
        for (let currentBetBox=0; currentBetBox<this.bet_boxes.length; currentBetBox++){
            let betbox:BetBox = this.bet_boxes[currentBetBox];
            if (betbox.player == null) continue;
            console.log("Box No. "+(currentBetBox+1)+": ");
            for (let currentHand=0; currentHand<betbox.hands.length; currentHand++){
                let hand:Hand = betbox.hands[currentHand];
                console.log("Hand No. "+(currentHand+1)+ ": Wager: $" + hand.bet + " Cards: " + hand.cards.map(card => card.toString()).join(" | "));
            }  
        }
            
    }
}

class Player{
    name: string = "David";
    stack: number = 0;

    constructor(){
        this.stack = 1000;
    }
}

class Hand{
    cards: Game.Card[] = [];
    cards_value: number = 0;
    bet: number = 0;
    
    constructor(bet:number){
        this.bet = bet;
    }

    public hit(card:Game.Card): void{
        this.cards.push(card);
        this.cards_value += card.value;
    }

    public stand(): void{}
    public double(): void{}
    public split(): void{}
    public surrender(): void{}
    public insurance(): void{}
}

class BetBox{
    player!: Player;
    hands: Hand[] = [];

    constructor(){}

    public placeBet(bet: number){
        this.hands.push(new Hand(bet));
        this.player.stack -= bet;
    }
}

let game = new BlackjackGame();





