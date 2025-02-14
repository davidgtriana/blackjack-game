import {DiceRoller} from "./blackjack/dice-roller.js";
import {Hand} from "./blackjack/hand.js"
import {Player} from "./blackjack/player.js"
import {BetBox} from "./blackjack/bet-box.js"
import { GameConfig } from "./config.js";
import * as Game from "./blackjack/card-game.js";

declare const gsap: any; // 👈 This tells TypeScript to ignore the missing import

let DEBUG_MODE: boolean = true;

class BlackjackGame {
    // 3 Bet Boxes w/ 3 Players
    // Seed: 1287203866
    // --- Dealer Busts with 7 cards if played perfectly
    // Seed: 2720374580
    // --- Box 3 has Pocket Aces
    // Seed: 2664819274
    // --- All boxes can be doubled if played perfectly
    // Seed: 4226777415
    // --- Blazing 9's on Box 1 and Pocket 6's on Box 3
    die: DiceRoller = new DiceRoller();

    shoe!: Game.StackCard;
    discard_pile!: Game.StackCard;

    dealerHand!: Hand;
    players: Player[] = [];

    bet_boxes: BetBox[] = [];
    active_hands: Hand[] = [];
    current_hand_playing_index: number = 0;
    

    constructor(){
        
        // Start the table
        this.initializeTable();

        // Sit the players
        this.seatPlayers();

        // Start New Shoe
        this.startNewShoe();
        
        //this.courseOfPlay();
        //this.payAndTake();
    }
    
    public initializeTable(){
        // Creates Objects
        this.dealerHand = new Hand(0,0,0);
        this.discard_pile = new Game.StackCard(0);

        // -- Create the Bet Boxes
        for(let i=0; i < GameConfig.BET_BOXES_AMOUNT;i++)
            this.bet_boxes.push(new BetBox(i+1));

        // Instantiate Bet Boxes HTML Elements
        const element_bet_boxes_area = document.getElementById("bet-boxes-area")!;
        for(let currentBetBox=0; currentBetBox < GameConfig.BET_BOXES_AMOUNT; currentBetBox++){
            const betbox = this.bet_boxes[currentBetBox];
            const element_betbox = document.createElement("div");
            element_betbox.className = "bet-box";
            element_betbox.id = "bet-box-"+betbox.id;
            element_bet_boxes_area.append(element_betbox);
        }
    }

    public seatPlayers() {

        // Create Players
        this.players.push(new Player("Juan"));
        this.players.push(new Player("David"));
        this.players.push(new Player("Godoy"));
        this.players.push(new Player("Triana"));
        this.players.push(new Player("Daiki"));
        this.players.push(new Player("Kazuma"));
        this.players.push(new Player("Yuki"));
        this.players.push(new Player("Yoshida"));
        this.players.push(new Player("Yamada"));

        // Assigning a player per Bet Box
        for (let i=0;i<this.bet_boxes.length;i++){
            //if (i==2) continue;
            this.bet_boxes[i].player = this.players[i];
        }

        // Place Player Bets
        for (let i=0;i<this.bet_boxes.length;i++){
            //if (i==2) continue;
            this.bet_boxes[i].placeBet(25);// Creates the first Hand of this bet box
        }

        // Iterate through each Bet Box with a hand to create its Hand Elements
        for (let betbox of this.bet_boxes){
            if (betbox.player == null) continue;
            const element_betbox = document.getElementById("bet-box-"+betbox.id)!;
            
            // Displaying Hand Element Per Bet Box
            for(let currentHand = 0; currentHand < betbox.hands.length ; currentHand++){
                const hand = betbox.hands[currentHand];
                const element_hand = document.createElement("div");
                element_hand.className = "hand"+" hand-"+(currentHand+1);
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
    }

    public startNewShoe() {
        
        // -- Prepare the Shoe
        this.shoe = new Game.StackCard(GameConfig.DECKS_PER_SHOE);
        this.shoe.shuffle(this.die);
        this.shoe.print();

        // -- Burning Card
        this.discard_pile.add(this.shoe.draw()!);
    }

    public async initialDealOut(){

        // Track Active Hands
        for (let betbox of this.bet_boxes){
            if (betbox.player == null) continue;
            for (let hand of betbox.hands)
                this.active_hands.push(hand);
        }

        // Deal the Primary Card to Players
        for (let hand of this.active_hands)
            await this.hitHand(hand,this.shoe.draw()!);
            

        // Deal the Primary Card to Dealer
        await this.hitHand(this.dealerHand,this.shoe.draw()!,"dealer");

        // Deal the Secondary Card to Players
        for (let hand of this.active_hands)
            await this.hitHand(hand,this.shoe.draw()!);
            
        // Deal the Secondary Card to Dealer
        //if (!this.IS_EUROPEAN_NO_HOLE_CARD) this.dealerHand.hit(this.shoe.draw()!);
        
        if (DEBUG_MODE) this.displayConsole();
        this.courseOfPlay();
    }

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    public async hitHand(hand: Hand, card: Game.Card, entity: string = "player") {
        await this.delay(200); // 🕒 Wait 1 second before dealing
        playDealSound();   
        hand.hit(card);
        const card_id = hand.cards.length - 1;
        const element_card = this.createCardImgElement(card, card_id + 1);
        
        let element_area = entity === "dealer" 
            ? document.getElementById("dealer-area") : document.getElementById(`bet-box-${hand.betbox_id}`);
        if (!element_area) return;
        
        // Update Hand Value
        const element_value = element_area.querySelector(".value");
        if (element_value) element_value.textContent = hand.getHandValue();
        
        // Add Card Element
        //const element_hand = element_area.querySelector(`.hand${entity === "player" ? `-` + hand.id : ``}`);
        const element_hand = element_area.querySelector(".hand" + (entity=="player"?"-"+hand.id.toString():""));
        if (element_hand) {
            const top_offset = 90;
            element_hand.appendChild(element_card);
            

            if(entity=="player"){
                gsap.set(element_card,{
                    position: "absolute",
                    top: "-400px",
                    left: "0px",
                    opacity: 0,
                    rotation: gsap.utils.random(-100, 100),
                });
                gsap.to(element_card, {
                    position: "absolute",
                    duration: 0.7,
                    opacity: 1,
                    top: `${-top_offset + card_id * -30}px`,
                    left: `${card_id * 35}px`,
                    rotation: 0,
                    ease: "power2.out"
                });
            }
            if(entity=="dealer"){
                gsap.set(element_card,{
                    position: "absolute",
                    top: "-100px",
                    left: "200px",
                    opacity: 0,
                    scale: 1,
                    rotation: gsap.utils.random(-100, 100),
                });
                gsap.to(element_card, {
                    position: "relative",
                    duration: 0.7,
                    opacity: 1,
                    top: 0,
                    left: 0,
                    rotation: 0,
                    ease: "power2.out"
                });
            }
        }
    }    
    
    
    public courseOfPlay() {

        this.playNextHand();
        
    }

    public playNextHand(){
        // Check if all hands have been played
        if(this.current_hand_playing_index >= this.active_hands.length){
            if(DEBUG_MODE) console.log("All hands have been played. Dealer's turn...");
            this.playDealerHand();
            return;
        }

        // Select the current hand to play
        const hand = this.active_hands[this.current_hand_playing_index];
        if(DEBUG_MODE) console.log("Current Hand Playing: " + (this.current_hand_playing_index+1));

        // Highlight the current hand in the UI
        const element_betbox = document.getElementById("bet-box-"+hand.betbox_id);
        const element_hand = element_betbox?.querySelector(".hand-"+hand.id);
        element_hand?.classList.add("current_turn");

        if(hand.total == 21 && hand.cards.length == 2){
            if(DEBUG_MODE) console.log("Blackjack!");
            this.finishHand();
            return;
        }

        if(DEBUG_MODE) console.log("Waiting for playing action...");
    }

    public async playDealerHand(){
        if (this.dealerHand.total > 21){
            if(DEBUG_MODE) console.log("Dealer has Too Many...");
            return
        }

        if (this.dealerHand.total == 21 && this.dealerHand.cards.length == 2){
            if(DEBUG_MODE) console.log("Dealer has a Blackjack...");
            return;
        }

        if (this.dealerHand.total > 17){
            if(DEBUG_MODE) console.log("Dealer stands on "+ this.dealerHand.total +"...");
            return;
        }

        if (this.dealerHand.total == 17){
            if (this.dealerHand.isSoft()){
                if(GameConfig.IS_DEALER_HIT_ON_17){
                    if(DEBUG_MODE) console.log("Dealer hits on soft 17...");
                    await this.hitHand(this.dealerHand, this.shoe.draw()!, "dealer");
                    this.dealerHand.print();
                    this.playDealerHand();
                    return;
                } else {
                    if(DEBUG_MODE) console.log("Dealer stands on soft 17...");
                    return;
                }
            }
            if(DEBUG_MODE) console.log("Dealer stands on hard 17...");
            return;
        }

        if (this.dealerHand.total < 17){
            if(DEBUG_MODE) console.log("Dealer hits on "+ this.dealerHand.total +"...");
            await this.hitHand(this.dealerHand, this.shoe.draw()!, "dealer");
            this.dealerHand.print();
            this.playDealerHand();
            return;
        }
    }
    
    public finishHand(){
        // Remove the highlight from the current hand
        const element_current_turn = document.querySelector(".current_turn");
        element_current_turn?.classList.remove("current_turn"); 

        // Make this hand inactive
        this.active_hands[this.current_hand_playing_index].isActive = false;

        // Continue playing the next hand
        this.current_hand_playing_index++;
        this.playNextHand();
    }



    public payAndTake() {
        
    }

    public displayConsole(){
        console.log("Seed: "+ this.die.getSeed());

        // Displaying Dealer's hand in the console
        console.log("Dealer Hand: ");
        this.dealerHand.print();

        // Printing Players' Hands in the console
        for (let currentBetBox=0; currentBetBox<this.bet_boxes.length; currentBetBox++){
            let betbox:BetBox = this.bet_boxes[currentBetBox];
            if (betbox.player == null) continue;
            console.log("Box No. "+(currentBetBox+1)+": Player: " + betbox.player.name);
            for (let currentHand=0; currentHand<betbox.hands.length; currentHand++){
                let hand:Hand = betbox.hands[currentHand];
                hand.print(currentHand+1);
            }  
        }
        
    }

    public createCardImgElement(card: Game.Card, id: number): HTMLElement{

        // Card Images Origin h: 240 w: 160
        let cards_path: string = "./assets/cards/"
        let img_type_file: string = ".png";

        const cardImg = document.createElement("img");
        cardImg.className = "card card-"+id;
        cardImg.src = cards_path+card.toString(false)+img_type_file; 

        return cardImg;
    }
}
let game = new BlackjackGame();


// Setting up the hover sound for the buttons
const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        playHoverButtonSound();
    });
});
    
// Setting up the click event for the deal button
document.getElementById("btn-deal")?.addEventListener("click", () => {
    if(game.active_hands.length != 0) return; 
    game.initialDealOut();
});

document.getElementById("btn-hit")?.addEventListener("click", async () => {
    // Do nothing if there are no active hands
    if(game.active_hands.length == 0) return; 

    // Get the current hand
    const hand = game.active_hands[game.current_hand_playing_index];

    // Hit the hand
    await game.hitHand(hand, game.shoe.draw()!);

    if(DEBUG_MODE) console.log("Hit button clicked for the hand No: " + hand.id + " of Bet Box: " + hand.betbox_id);

    if(DEBUG_MODE) hand.print();

    // Check if the hand is busted
    if(hand.total > 21){
        if(DEBUG_MODE) console.log("Too Many!");
        game.finishHand();
    }
    if(hand.total == 21){
        if(DEBUG_MODE) console.log("21!! Nice Hit!");
        game.finishHand();
    }
});

document.getElementById("btn-stand")?.addEventListener("click", async () => {
    // Do nothing if there are no active hands
    if(game.active_hands.length ==0) return; 

    // Get the current hand
    const hand = game.active_hands[game.current_hand_playing_index];

    if(DEBUG_MODE) console.log("Stand button clicked for the hand No: " + hand.id + " of Bet Box: " + hand.betbox_id);

    // Stand the hand by finishing it
    game.finishHand();

});



function playDealSound() {
    let audioCtx = new window.AudioContext();
    fetch("./assets/sounds/dealing_card.mp3")
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            let source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        });
}

function playHoverButtonSound() {
    let audioCtx = new window.AudioContext();
    fetch("./assets/sounds/hover_button.wav")
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            let source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        });
}