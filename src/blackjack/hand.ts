import { GameConfig } from "../config.js";
import * as Game from "./card-game.js";

export class Hand{
    cards: Game.Card[] = [];

    betbox_id: number;
    id: number;
    primary_bet: number;
    secondary_bet: number;
    total: number = 0;
    ace_count: number = 0;

    isOnTheTable: boolean; // Is the hand still on the table?
    isBusted: boolean; // Is the hand total higher than 21?
    isBlackJack: boolean; // Is the hand a blackjack?
    isFinished: boolean; // Has the hand finish its turn?
    isSplitted: boolean; // Is the hand splitted? (More hands in the same betbox)
    isSplitEnabled: boolean; // Does the hand have 2 cards and are both the same point value?
    isDoubled: boolean;
    isDoubleDownEnabled: boolean; // Does the hand have only 2 cards?
    isSurrenderEnabled: boolean; // Has there been any action on the hand?

    // Special Cases:
    //  - A hand may be busted but active at the same time.

    constructor(id:number, betbox_id: number){
        this.betbox_id = betbox_id;
        this.id = id;
        this.primary_bet = 0;
        this.secondary_bet = 0;
        this.total = 0;
        this.ace_count = 0;

        this.isOnTheTable = true; 
        this.isBusted = false;
        this.isBlackJack = false;
        this.isFinished = false;
        this.isSplitted = false;
        this.isSplitEnabled = false;
        this.isDoubled = false;
        this.isDoubleDownEnabled = true;
        this.isSurrenderEnabled = true;
    }

    public addCard(card:Game.Card): void{

        // Add card to the list of cards of the hand
        this.cards.push(card);

        // Add the value of the card to the hand value
        if(card.value == 1){ // ACE
            this.ace_count++;
            this.total += 11;
        } else if (card.value >= 10){ // Face Card
            this.total += 10;
        } else { // Number Cards (2-9)
            this.total += card.value;
        }

        // Adjust for Aces if total exceeds 21
        if (this.total > 21 && this.ace_count > 0){
            this.total -= 10;
            this.ace_count--;
        }

        if (this.cards.length == 2){

            if(this.total == 21){
                this.isFinished = true;
                if(!this.isSplitted){
                    this.isBlackJack = true;
                    this.isDoubleDownEnabled = false;
                    this.isSurrenderEnabled = false;
                }
                return;
            }

            // Check if it can be splittable
            if(this.areCardsSamePointValue())
                if(this.id < GameConfig.MAX_HANDS_PER_BOX)
                    this.isSplitEnabled = true;
                
        }

        if (this.cards.length >= 3) {
            // Disable double down and surrender if hand has 3 cards or more
            this.isDoubleDownEnabled = false;
            this.isSurrenderEnabled = false;

            if (this.total > 21){
                this.isBusted = true;
                this.isFinished = true;
            }
        }
    }

    public removeCard(): Game.Card{
        this.isSurrenderEnabled = false;

        // Remove the cards of the list of cards
        const card = this.cards.pop()!;
        
        // Face Card (J, Q, K)
        if (card.value >= 10) { 
            this.total -= 10;
            
        // Number Cards (1-9)
        } else { 
            this.total -= card.value;
        }

        return card;
    }

    public split(new_id:number): Hand {
        const new_hand = new Hand(new_id, this.betbox_id);
        new_hand.primary_bet = this.primary_bet;
        
        this.isSplitted = true;
        new_hand.isSplitted = true;
        this.isSplitEnabled = false;
        new_hand.isSplitEnabled= false;
        this.isSurrenderEnabled = false;
        new_hand.isSurrenderEnabled = false;

        new_hand.addCard(this.removeCard());

        return new_hand;
    }
    get print_id(): string{
        return "BB" + this.betbox_id + "H"+ this.id + ":";
    }
    public print(){
        console.log(
            "BB" + this.betbox_id +
            "H" + (this.id?this.id:0) +
            ": A?" + this.isOnTheTable + 
            " B?" + this.isBusted + 
            " BJ?" + this.isBlackJack +
            " pBJ?" + this.isTherePotentialForBJ() +
            " F?" + this.isFinished +
            " SpH?" + this.isSplitted + 
            " SpE?" + this.isSplitEnabled + 
            " DDH?" + this.isDoubled +
            " DDE?"+ this.isDoubleDownEnabled + 
            " Sr?"+ this.isSurrenderEnabled + 
            " TT" + this.getHandTotal() + 
            " #A" + this.ace_count + 
            " B1$" + this.primary_bet + " B2$" + this.secondary_bet + 
            " C: " + this.cards.map(card => card.toString(true)).join(" | "));
    }

    public setBet(bet: number) {
        this.primary_bet = bet;
    }
    
    public getHandTotal():string{
        if (this.cards.length == 0) return "0";

        if (this.total > 21) return "💥";

        if (this.isBlackJack){
            return "BJ";
        }else if(this.id > 1){
            return this.total.toString();
        }
        if (this.isSoft() && !this.isFinished) {
            return this.total.toString() + "/" + (this.total - 10).toString();
        } else {
            return this.total.toString();
        }
    }

    public isSoft():boolean{
        return this.total <= 21 && this.ace_count > 0;
    }

    public reset() : void{
        this.cards = [];

        this.primary_bet = 0;
        this.secondary_bet = 0;
        this.total = 0;
        this.ace_count = 0;

        this.isOnTheTable = false; 
        this.isBusted = false;
        this.isBlackJack = false;
        this.isFinished = false;
        this.isSplitted = false;
        this.isSplitEnabled = false;
        this.isDoubled = false;
        this.isDoubleDownEnabled = true;
        this.isSurrenderEnabled = true;
    }

    get primary_card(): Game.Card{ return this.cards[0];}
    get secondary_card(): Game.Card{ return this.cards[1];}

    public areCardsSamePointValue(): boolean{
        return (this.primary_card.value >= 10 && this.secondary_card.value >= 10) || (this.primary_card.value == this.secondary_card.value);
    }
    public isTherePotentialForBJ(): boolean{
        return this.primary_card.value >= 10 || this.primary_card.value == 1;
    }

}

