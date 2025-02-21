import { DiceRoller } from "./blackjack/dice-roller.js";
import { Hand } from "./blackjack/hand.js";
import { Player } from "./blackjack/player.js";
import { BetBox } from "./blackjack/bet-box.js";
import { GameConfig } from "./config.js";
import * as Game from "./blackjack/card-game.js";
let DEBUG_MODE = true;
let audioCtx = new window.AudioContext();
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
    // Seed: 2910211537
    // --- Soft Total on Box 1 and BJ on Box 2
    // Seed: 1026684650
    // --- BJ on Box 3 an Dealer 6
    // 2 Bet Boxes w/ 2 players
    // Seed: 4147411243
    // --- 6/6 in Box 1 - 10/10 in Box 2 and Dealer 10
    // 2169519979 KK candidate
    die = new DiceRoller(289368277);
    shoe;
    discard_pile;
    dealerHand;
    players = [];
    bet_boxes = [];
    active_hands = [];
    current_active_hand = 0;
    element_buttons = new Map();
    constructor() {
        if (DEBUG_MODE)
            console.log("Seed: " + this.die.getSeed());
        // Start the table
        this.instantiateTableGame();
        // Start New Shoe
        this.startNewShoe();
        // Sit the players
        this.seatPlayers();
        // Place the initial bets
        //this.placeBets();        
    }
    instantiateTableGame() {
        // Instantiate Table Game Objects
        this.dealerHand = new Hand(0, 0);
        this.discard_pile = new Game.StackCard(0);
        // Create the Shoe Preview Area
        const element_shoe_preview_area = document.getElementById("shoe-preview-area");
        element_shoe_preview_area.innerHTML = "";
        const element_cards = document.createElement("div");
        element_cards.className = "cards";
        element_shoe_preview_area.append(element_cards);
        // Getting Dealer Area Element
        const element_dealer_area = document.getElementById("dealer-area");
        element_dealer_area.innerHTML = "";
        // Create Hand Element of the Dealer
        const element_dealer_hand = document.createElement("div");
        element_dealer_hand.className = "hand";
        element_dealer_area.appendChild(element_dealer_hand);
        // Create Value Element of the Dealer
        const element_dealer_value = document.createElement("div");
        element_dealer_value.className = "value";
        element_dealer_value.append(this.dealerHand.getHandTotal());
        element_dealer_hand.append(element_dealer_value);
        // Create Card Container Element of the Dealer
        const element_dealer_cards = document.createElement("div");
        element_dealer_cards.className = "cards";
        element_dealer_hand.appendChild(element_dealer_cards);
        // Bet Boxes Area
        const element_bet_boxes_area = document.getElementById("bet-boxes-area");
        element_bet_boxes_area.innerHTML = "";
        // -- Create the Bet Boxes
        for (let currentBetBox = 0; currentBetBox < GameConfig.BET_BOXES_AMOUNT; currentBetBox++) {
            // Instantiate Bet Box Object
            const betbox = new BetBox(currentBetBox + 1);
            this.bet_boxes.push(betbox);
            // Create Bet Box HTML Element
            const element_betbox = document.createElement("div");
            element_betbox.className = "bet-box" + " bet-box-" + betbox.id + " available";
            element_betbox.style.zIndex = (GameConfig.BET_BOXES_AMOUNT - currentBetBox).toString();
            element_bet_boxes_area.append(element_betbox);
        }
        // Create the Buttons
        const element_buttons_area = document.getElementById("buttons-area");
        const buttonConfig = {
            "btn-deal": { label: "Deal", action: () => actionDeal() },
            "btn-hit": { label: "Hit", action: () => actionHit() },
            "btn-stand": { label: "Stand", action: () => actionStand() },
            "btn-double": { label: "Double", action: () => actionDouble() },
            "btn-split": { label: "Split", action: () => actionSplit() },
            "btn-surrender": { label: "Surrender", action: () => actionSurrender() },
            "btn-insurance": { label: "Insurance", action: () => actionInsurance() },
            "btn-clear-bets": { label: "Clear Bets", action: () => actionClearBets() },
            "btn-undo": { label: "Undo", action: () => actionUndo() },
            "btn-reset-table": { label: "Reset Table", action: () => actionResetTable() },
            "btn-create-table": { label: "Create Table", action: () => actionCreateTable() },
            "btn-next-hand": { label: "Next Hand", action: () => actionNextHand() }
        };
        Object.entries(buttonConfig).forEach(([key, { label, action }]) => {
            const button = document.createElement("button");
            button.className = "btn " + key;
            button.textContent = label;
            // Append button to the UI
            element_buttons_area.appendChild(button);
            // Attach the event listener
            button.addEventListener("click", async () => { action(); });
            // Store the button reference
            this.element_buttons.set(key, button);
        });
        // Disable Buttons that are not needed before course of play
        this.element_buttons.get("btn-hit").style.display = "none";
        this.element_buttons.get("btn-stand").style.display = "none";
        this.element_buttons.get("btn-double").style.display = "none";
        this.element_buttons.get("btn-split").style.display = "none";
        this.element_buttons.get("btn-surrender").style.display = "none";
        this.element_buttons.get("btn-insurance").style.display = "none";
        this.element_buttons.get("btn-create-table").style.display = "none";
        this.element_buttons.get("btn-next-hand").style.display = "none";
    }
    seatPlayers() {
        // Create Players
        this.players.push(new Player("David"));
        // this.players.push(new Player("Juan"));
        // this.players.push(new Player("Godoy"));
        // this.players.push(new Player("Triana"));
        // this.players.push(new Player("Daiki"));
        // this.players.push(new Player("Kazuma"));
        // this.players.push(new Player("Yuki"));
        // this.players.push(new Player("Yoshida"));
        // this.players.push(new Player("Yamada"));
        // Assigning a player per Bet Box
        this.bet_boxes.forEach((betbox, index) => {
            if (index >= 9)
                return;
            betbox.player = this.players[0];
        });
    }
    placeBets(betbox_id, bet) {
        playCasinoChipSound();
        // Instantiate Hand Object
        const hand = new Hand(1, betbox_id + 1);
        const betbox = this.bet_boxes[betbox_id];
        betbox.hands.push(hand);
        betbox.placeBet(25);
        // Creating the Hand Element
        const element_betbox = document.querySelector(".bet-box-" + (betbox_id + 1).toString());
        const element_hand = this.createHandElement(hand, 0);
        element_betbox.appendChild(element_hand);
        document.querySelector(".stack-amount").textContent = betbox.player.stack.toString();
    }
    startNewShoe() {
        // -- Prepare the Shoe
        this.shoe = new Game.StackCard(GameConfig.DECKS_PER_SHOE);
        this.shoe.shuffle(this.die);
        // Adds the Cards to the Shoe preview on top of the page
        const element_cards = document.getElementById("shoe-preview-area").querySelector(".cards");
        this.shoe.cards.forEach((card, currentCard) => {
            const element_card = this.createCardElement(card, currentCard + 1);
            element_cards.append(element_card);
        });
        // -- Burning Card
        this.discard_pile.add(this.shoe.draw());
        // Update the Show Preview
        element_cards.firstChild.remove();
    }
    async initialDealOut() {
        // Disable Buttons that are not needed
        this.element_buttons.get("btn-deal").style.display = "none";
        this.element_buttons.get("btn-clear-bets").style.display = "none";
        this.element_buttons.get("btn-undo").style.display = "none";
        this.element_buttons.get("btn-reset-table").style.display = "none";
        this.current_active_hand = 0;
        // Track Active Hands
        for (let betbox of this.bet_boxes) {
            if (betbox.hands.length == 0)
                continue;
            const hand = betbox.hands[0];
            if (hand.isOnTheTable)
                this.active_hands.push(hand);
        }
        // Deal the Primary Card to Players
        for (let hand of this.active_hands)
            await this.hitHand(hand);
        // Deal the Primary Card to Dealer
        await this.hitHand(this.dealerHand, "dealer");
        // Deal the Secondary Card to Players
        for (let hand of this.active_hands)
            await this.hitHand(hand);
        // Deal the Secondary Card to Dealer
        //if (!this.IS_EUROPEAN_NO_HOLE_CARD) this.dealerHand.hit(this.shoe.draw()!);
        this.courseOfPlay();
    }
    async hitHand(hand, entity = "player") {
        await delay(GameConfig.DEAL_CARD_DELAY);
        // Play Deal Sound
        playDealSound();
        // Get the Card out of the Shoe
        const card = this.shoe.draw();
        // Add the Object card to the list of cards of the Hand Object
        hand.addCard(card);
        // Update the Shoe Preview
        let element_cards = document.getElementById("shoe-preview-area").querySelector(".cards");
        element_cards.firstChild.remove();
        // -------- GRAPHIC UPDATE OF THE HIT
        // Select the Parent Element of the Hand Element
        const element_area = entity == "dealer" ? document.getElementById("dealer-area") : document.querySelector(".bet-box-" + hand.betbox_id);
        // Selects the Hand Element of the Parent Element
        const element_hand = element_area.querySelector(".hand" + (entity == "dealer" ? "" : "-" + hand.id.toString()));
        // Update Hand Value
        const element_hand_value = element_hand.querySelector(".value");
        element_hand_value.textContent = hand.getHandTotal();
        if (hand.isBlackJack)
            element_hand_value.className = "value blackjack";
        if (hand.isBusted)
            element_hand_value.className = "value busted";
        // Selects the Cards Container of that Hand
        element_cards = element_hand.querySelector(".cards");
        element_cards.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        // Creates the HTML Card Element
        const card_id = hand.cards.length - 1;
        const element_card = this.createCardElement(card, card_id + 1);
        // Appends the Card Element to the Cards Container
        element_cards.appendChild(element_card);
        // Animate the Card Element
        const top_offset = 80;
        if (entity == "player") {
            gsap.set(element_card, {
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
                left: `${card_id * 25}px`,
                rotation: 0,
                ease: "power2.out"
            });
        }
        if (entity == "double") {
            gsap.set(element_card, {
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
                top: `${-top_offset + card_id * -50}px`,
                left: `${card_id * 15}px`,
                rotation: 90,
                onUpdate: function () {
                    const shadowY = gsap.utils.interpolate(5, -5, this.progress()); // Animate Y-offset
                    element_card.style.boxShadow = `5px ${shadowY}px 5px rgba(0, 0, 0, 0.25)`;
                },
                ease: "power2.out"
            });
        }
        if (entity == "dealer") {
            gsap.set(element_card, {
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
        //if(DEBUG_MODE) game.active_hands.forEach( hand => hand.print());
    }
    courseOfPlay() {
        if (DEBUG_MODE)
            console.log("Course of play...");
        this.element_buttons.get("btn-hit").style.display = "flex";
        this.element_buttons.get("btn-stand").style.display = "flex";
        this.playNextHand();
    }
    async playNextHand() {
        // Check if all hands have been played
        if (this.current_active_hand >= this.active_hands.length) {
            if (DEBUG_MODE)
                console.log("All hands have been played. Dealer's turn...");
            // Does the dealer have to play?
            if (this.active_hands.find(hand => hand.isOnTheTable) == null) {
                if (DEBUG_MODE)
                    console.log("Dealer doesn't need to play");
                return;
            }
            // Play the Dealer's Hand Recursively
            this.playDealerHand();
            this.dealerHand.isFinished = true;
            if (this.dealerHand.isSoft()) {
                const element_dealer_area = document.getElementById("dealer-area");
                const element_hand_value = element_dealer_area.querySelector(".hand .value");
                element_hand_value.textContent = this.dealerHand.getHandTotal();
            }
            this.element_buttons.get("btn-reset-table").style.display = "flex";
            this.element_buttons.get("btn-next-hand").style.display = "flex";
            return;
        }
        // Select the current hand to play
        const curren_hand = this.active_hands[this.current_active_hand];
        if (DEBUG_MODE)
            console.log("Current Hand Playing: " + (this.current_active_hand + 1));
        // Highlight the current hand in the UI
        const element_betbox = document.querySelector(".bet-box-" + curren_hand.betbox_id);
        const element_hand = element_betbox?.querySelector(".hand-" + curren_hand.id);
        element_hand.classList.add("current_turn");
        element_hand.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        // Update Button States
        this.element_buttons.get("btn-hit").style.display = "flex";
        this.element_buttons.get("btn-stand").style.display = "flex";
        if (curren_hand.isDoubleDownEnabled)
            this.element_buttons.get("btn-double").style.display = "flex";
        if (curren_hand.isSplitEnabled)
            this.element_buttons.get("btn-split").style.display = "flex";
        if (curren_hand.isSurrenderEnabled)
            this.element_buttons.get("btn-surrender").style.display = "flex";
        if (curren_hand.cards.length == 1)
            await this.hitHand(curren_hand);
        if (curren_hand.isFinished) {
            if (curren_hand.isBlackJack)
                if (DEBUG_MODE)
                    console.log("BlackJack...");
            this.finishHand();
        }
        if (DEBUG_MODE)
            console.log("Waiting for playing action...");
        game.print();
    }
    /**
     * Controls the dealer's actions according to standard blackjack rules.
     * This function is recursive, meaning it calls itself until the dealer's turn is complete.
     */
    async playDealerHand() {
        // If the dealer's total exceeds 21, they bust and stop playing.
        if (this.dealerHand.total > 21) {
            if (DEBUG_MODE)
                console.log("Dealer has Too Many...");
            this.dealerHand.isBusted = true;
            return;
        }
        // If the dealer has a natural blackjack (21 with exactly 2 cards), they stop.
        if (this.dealerHand.total == 21 && this.dealerHand.cards.length == 2) {
            if (DEBUG_MODE)
                console.log("Dealer has a Blackjack...");
            return;
        }
        // If the dealer's total is greater than 17, they must stand.
        if (this.dealerHand.total > 17) {
            if (DEBUG_MODE)
                console.log("Dealer stands on " + this.dealerHand.total.toString() + "...");
            return;
        }
        // Special case: If the dealer has exactly 17
        if (this.dealerHand.total == 17) {
            // Check if the dealer has a soft 17 (contains an Ace counted as 11)
            if (this.dealerHand.isSoft()) {
                // If the game rules allow hitting on soft 17, the dealer hits.
                if (GameConfig.IS_DEALER_HIT_ON_17) {
                    if (DEBUG_MODE)
                        console.log("Dealer hits on soft 17...");
                    await this.hitHand(this.dealerHand, "dealer");
                    this.playDealerHand(); // Recursive call to check if another hit is needed.
                    return;
                }
                else {
                    // Otherwise, the dealer stands on soft 17.
                    if (DEBUG_MODE)
                        console.log("Dealer stands on soft 17...");
                    return;
                }
            }
            // If it's a hard 17 (no Ace counted as 11), the dealer must stand.
            if (DEBUG_MODE)
                console.log("Dealer stands on hard 17...");
            return;
        }
        // If the dealer's total is below 17, they must hit.
        if (this.dealerHand.total < 17) {
            if (DEBUG_MODE)
                console.log(`Dealer hits on ${this.dealerHand.total}...`);
            await this.hitHand(this.dealerHand, "dealer");
            this.playDealerHand(); // Recursive call to continue hitting until they stand or bust.
            return;
        }
    }
    finishHand() {
        game.element_buttons.get("btn-hit").style.display = "none";
        game.element_buttons.get("btn-stand").style.display = "none";
        // Select the current hand to play
        const hand = this.active_hands[this.current_active_hand];
        hand.isFinished = true;
        // Check if the hand should still on the table
        if (game.dealerHand.isTherePotentialForBJ()) {
            if (!(hand.isSplitted || hand.isDoubled))
                if (!hand.isBlackJack && hand.isBusted)
                    hand.isOnTheTable = false;
        }
        else {
            if (hand.isBlackJack || hand.isBusted)
                hand.isOnTheTable = false;
        }
        // Select the current Hand Element
        const element_hand_current_turn = document.querySelector(".current_turn");
        // Update Hand Value
        if (this.active_hands[this.current_active_hand].isSoft()) {
            const element_value = element_hand_current_turn.querySelector(".value");
            element_value.textContent = hand.getHandTotal();
        }
        // Remove the current_turn class
        element_hand_current_turn.classList.remove("current_turn");
        // Continue playing the next hand
        this.current_active_hand++;
        this.playNextHand();
    }
    payAndTake() {
    }
    displayConsole() {
        // Displaying Dealer's hand in the console
        console.log("Dealer Hand: ");
        this.dealerHand.print();
        // Printing Players' Hands in the console
        for (let currentBetBox = 0; currentBetBox < this.bet_boxes.length; currentBetBox++) {
            const betbox = this.bet_boxes[currentBetBox];
            if (betbox.player == null)
                continue;
            console.log("Box No. " + (currentBetBox + 1) + ": Player: " + betbox.player.name);
            for (let currentHand = 0; currentHand < betbox.hands.length; currentHand++) {
                const hand = betbox.hands[currentHand];
                hand.print();
            }
        }
    }
    createCardElement(card, id) {
        // Card Images Origin h: 240 w: 160
        let cards_path = "./assets/cards/";
        let img_type_file = ".png";
        const element_card = document.createElement("img");
        element_card.className = "card card-" + id;
        element_card.src = cards_path + card.toString(false) + img_type_file;
        return element_card;
    }
    createHandElement(hand, id) {
        // Create Hand HTML Element
        const element_hand = document.createElement("div");
        element_hand.className = "hand" + " hand-" + (id + 1);
        // Create Value, Bet and Card Container Elements of the Hand
        const element_hand_value = document.createElement("div");
        element_hand_value.className = "value";
        element_hand_value.append(hand.getHandTotal());
        element_hand.appendChild(element_hand_value);
        const element_hand_bet = document.createElement("div");
        element_hand_bet.className = "bet";
        element_hand_bet.append(hand.primary_bet.toString());
        element_hand.appendChild(element_hand_bet);
        const element_cards = document.createElement("div");
        element_cards.className = "cards";
        element_hand.appendChild(element_cards);
        return element_hand;
    }
    print() {
        this.dealerHand.print();
        console.log("List of Active Hands: ");
        this.active_hands.forEach(hand => { hand.print(); });
    }
}
let game = new BlackjackGame();
// Setting up the hover sound for the buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('mouseenter', function () {
        playHoverButtonSound();
    });
});
document.querySelectorAll(".bet-box").forEach(element_betbox => {
    element_betbox.addEventListener("click", async (event) => {
        if (game.active_hands.length != 0)
            return;
        let classes = event.currentTarget?.classList; // Get all classes
        let element_betbox_class_selected = [...classes].find(cls => cls.startsWith("bet-box-"));
        let bet_box_id_selected = parseInt(element_betbox_class_selected.split("-")[2]);
        if (game.bet_boxes[bet_box_id_selected - 1].hands.length >= 1)
            return;
        element_betbox.className = "bet-box " + element_betbox_class_selected;
        game.placeBets(bet_box_id_selected - 1, 25);
    });
});
function playDealSound() {
    fetch("./assets/sounds/dealing_card.mp3")
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
        let source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(0);
    })
        .catch(error => console.error("Error playing sound:", error));
}
function playHoverButtonSound() {
    fetch("./assets/sounds/hover_button.wav")
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
        let source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(0);
    })
        .catch(error => console.error("Error playing sound:", error));
}
function playCasinoChipSound() {
    fetch("./assets/sounds/casino_chip.wav")
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
        let source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(0);
    })
        .catch(error => console.error("Error playing sound:", error));
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function actionDeal() {
    if (game.active_hands.length != 0)
        return;
    const element_betbox_unselected_list = document.querySelectorAll(".available");
    if (element_betbox_unselected_list.length == GameConfig.BET_BOXES_AMOUNT)
        return;
    if (DEBUG_MODE)
        console.log("Initial Deal Out...");
    element_betbox_unselected_list.forEach(element_betbox => {
        const element_id = element_betbox.className.match(/bet-box-(\d+)/);
        element_betbox.className = "bet-box bet-box-" + element_id[1];
    });
    game.initialDealOut();
}
async function actionHit() {
    // Do nothing if there are no active hands
    if (game.active_hands.length == 0)
        return;
    if (game.current_active_hand == game.active_hands.length)
        return;
    // Get the current hand
    const current_hand = game.active_hands[game.current_active_hand];
    game.element_buttons.get("btn-double").style.display = "none";
    game.element_buttons.get("btn-split").style.display = "none";
    game.element_buttons.get("btn-surrender").style.display = "none";
    // Hit the hand
    await game.hitHand(current_hand);
    if (DEBUG_MODE)
        console.log(current_hand.print_id + " Hits");
    // Check if the hand is busted
    if (current_hand.total >= 21) {
        if (current_hand.total == 21) {
            if (DEBUG_MODE)
                console.log("21!! Nice Hit!");
        }
        if (current_hand.total > 21) {
            if (DEBUG_MODE)
                console.log("Too many");
        }
        if (DEBUG_MODE)
            game.print();
        game.finishHand();
    }
}
async function actionStand() {
    // Do nothing if there are no active hands
    if (game.active_hands.length == 0)
        return;
    if (game.current_active_hand == game.active_hands.length)
        return;
    // Get the current hand
    const current_hand = game.active_hands[game.current_active_hand];
    game.element_buttons.get("btn-double").style.display = "none";
    game.element_buttons.get("btn-split").style.display = "none";
    game.element_buttons.get("btn-surrender").style.display = "none";
    if (DEBUG_MODE)
        console.log(current_hand.print_id + " Stands");
    // Stand the hand by finishing it
    game.finishHand();
}
async function actionDouble() {
    if (game.active_hands.length == 0)
        return;
    if (game.current_active_hand == game.active_hands.length)
        return;
    // Get the Current Hand Object in Play
    const current_hand = game.active_hands[game.current_active_hand];
    if (!current_hand.isDoubleDownEnabled)
        return;
    game.element_buttons.get("btn-double").style.display = "none";
    game.element_buttons.get("btn-split").style.display = "none";
    game.element_buttons.get("btn-surrender").style.display = "none";
    if (DEBUG_MODE)
        console.log(current_hand.print_id + " Doubles");
    await game.hitHand(current_hand, "double");
    current_hand.isDoubled = true;
    const current_betbox = game.bet_boxes[current_hand.betbox_id - 1];
    current_hand.secondary_bet = current_hand.primary_bet;
    current_betbox.player.stack -= current_hand.secondary_bet;
    document.querySelector(".stack-amount").textContent = current_betbox.player.stack.toString();
    const element_bet_boxes_area = document.getElementById("bet-boxes-area");
    const element_betbox = element_bet_boxes_area?.querySelector(".bet-box-" + current_hand.betbox_id);
    const element_hand = element_betbox.querySelector(".hand-" + current_hand.id);
    const element_hand_bet = element_hand.querySelector(".bet");
    element_hand_bet.textContent = (current_hand.primary_bet + current_hand.secondary_bet).toString();
    if (DEBUG_MODE)
        game.print();
    game.finishHand();
}
async function actionSplit() {
    if (game.active_hands.length == 0)
        return;
    // Get the Current Hand Object in Play
    const current_hand = game.active_hands[game.current_active_hand];
    if (!current_hand.isSplitEnabled)
        return;
    game.element_buttons.get("btn-surrender").style.display = "none";
    if (DEBUG_MODE)
        console.log(current_hand.print_id + " Splits");
    const current_betbox = game.bet_boxes[current_hand.betbox_id - 1];
    const new_hand = current_hand.split(current_betbox.hands.length + 1);
    current_betbox.player.stack -= new_hand.primary_bet;
    document.querySelector(".stack-amount").textContent = current_betbox.player.stack.toString();
    // Add the New Hand Object to the list of active hands in the correspondient position
    game.active_hands.splice((game.current_active_hand - (current_hand.id - 1) + current_betbox.hands.length), 0, new_hand);
    // Add the New Hand to the list of Hands of the current BetBox
    game.bet_boxes[current_hand.betbox_id - 1].hands.push(new_hand);
    // -------- GRAPHIC UPDATE OF THE HIT
    // Find the Current Bet Box Element
    const element_bet_boxes_area = document.getElementById("bet-boxes-area");
    const element_betbox = element_bet_boxes_area.querySelector(".bet-box-" + current_hand.betbox_id);
    // Create the HTML Hand Element
    const element_new_hand = game.createHandElement(new_hand, element_betbox.children.length);
    // Update the New Hand Element
    const element_new_hand_value = element_new_hand.querySelector(".value");
    element_new_hand_value.style.visibility = "visible";
    element_new_hand_value.textContent = new_hand.getHandTotal();
    const element_new_hand_bet = element_new_hand.querySelector(".bet");
    element_new_hand_bet.textContent = new_hand.primary_bet.toString();
    element_new_hand_bet.style.visibility = "visible";
    const element_new_hand_cards = element_new_hand.querySelector(".cards");
    // Update the position of the Cards Element
    const element_current_hand = element_betbox.querySelector(".hand-" + current_hand.id);
    const element_current_hand_cards = element_current_hand.querySelector(".cards");
    const element_card = element_current_hand_cards.lastChild;
    element_card.className = "card card-1";
    element_new_hand_cards?.append(element_card);
    gsap.set(element_card, {
        position: "absolute",
        top: "0px",
        left: "100px",
        opacity: 0,
        rotation: gsap.utils.random(-100, 100),
    });
    gsap.to(element_card, {
        position: "absolute",
        duration: 0.3,
        opacity: 1,
        top: (-80).toString() + "px",
        left: "0px",
        rotation: 0,
        ease: "power2.out"
    });
    // Add the Hand Element to the BetBox Element
    element_betbox.append(element_new_hand);
    await game.hitHand(current_hand);
    if (current_betbox.hands.length == GameConfig.MAX_HANDS_PER_BOX) {
        current_hand.isSplitEnabled = false;
        new_hand.isSplitEnabled = false;
    }
    if (current_hand.primary_card.value == 1) {
        current_hand.isFinished = true;
        new_hand.isFinished = true;
    }
    if (!current_hand.isSplitEnabled)
        game.element_buttons.get("btn-split").style.display = "none";
    if (DEBUG_MODE)
        game.print();
    if (current_hand.isFinished)
        game.finishHand();
}
async function actionSurrender() {
    if (DEBUG_MODE)
        console.log("Surrender button clicked...");
}
async function actionInsurance() {
    if (DEBUG_MODE)
        console.log("Insurance button clicked...");
}
async function actionUndo() {
    if (DEBUG_MODE)
        console.log("Undo button clicked...");
}
async function actionClearBets() {
    if (DEBUG_MODE)
        console.log("Clear Bets button clicked...");
}
async function actionResetTable() {
    if (DEBUG_MODE)
        console.log("Create reset button clicked...");
}
async function actionCreateTable() {
    if (DEBUG_MODE)
        console.log("Create table button clicked...");
}
async function actionNextHand() {
    // Do nothing if there are no active hands
    if (game.active_hands.length == 0)
        return;
    if (game.current_active_hand != game.active_hands.length)
        return;
    if (DEBUG_MODE)
        console.log("Next Hand...");
    // Resets the Dealer hand
    game.dealerHand.reset();
    // Update Dealer Value
    const element_dealer_area = document.getElementById("dealer-area");
    const element_dealer_value = element_dealer_area.querySelector(".hand .value");
    element_dealer_value.innerHTML = "0";
    // Clean the BetBoxes hands
    game.bet_boxes.forEach(betbox => {
        betbox.hands = [];
    });
    // Clean the Active Hands Tracker
    game.active_hands = [];
    const element_bet_boxes_area = document.getElementById("bet-boxes-area");
    let element_cards_list = element_dealer_area.querySelectorAll(".cards");
    element_cards_list.forEach(element_cards => {
        element_cards.innerHTML = "";
    });
    // Erase Hands Elements
    const element_bet_boxes_list = element_bet_boxes_area.querySelectorAll(".bet-box");
    element_bet_boxes_list.forEach(element_betbox => {
        element_betbox.innerHTML = "";
        const element_id = element_betbox.className.match(/bet-box-(\d+)/);
        element_betbox.className = "bet-box bet-box-" + element_id[1] + " available";
    });
    // Reset Button States
    game.element_buttons.get("btn-deal").style.display = "flex";
    game.element_buttons.get("btn-clear-bets").style.display = "flex";
    game.element_buttons.get("btn-undo").style.display = "flex";
    game.element_buttons.get("btn-reset-table").style.display = "flex";
    game.element_buttons.get("btn-next-hand").style.display = "none";
}
