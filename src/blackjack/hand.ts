import * as Game from "./card-game.js";

export class Hand{
    cards: Game.Card[] = [];

    betbox_id: number;
    id: number;
    primary_bet: number;
    secondary_bet: number;
    total: number = 0;
    ace_count: number = 0;

    isActive: boolean; // Is the hand still on the table?
    isBusted: boolean; // Is the hand total higher than 21?
    isBlackJack: boolean; // Is the hand a blackjack?
    isFinished: boolean; // Has the hand finish its turn?
    isSplitted: boolean; // Is the hand splitted? (More hands in the same betbox)
    isSplitEnabled: boolean; // Does the hand have 2 cards and are both the same point value?
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

        this.isActive = false; 
        this.isBusted = false;
        this.isBlackJack = false;
        this.isFinished = false;
        this.isSplitted = false;
        this.isSplitEnabled = false;
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
                if(!this.isSplitted) this.isBlackJack = true;
                return;
            }

            // Check if it can be splittable
            this.isSplitEnabled = areCardsSamePointValue(this.cards[0],this.cards[1]);
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
        console.table(this);
        // Remove the cards of the list of cards
        const card = this.cards.pop()!;
        
        // Adjust total value of the hand
        // Ace
        if (card.value == 1){
            this.total--;
            console.table(this);

        // Face Card (J, Q, K)
        } else if (card.value >= 10) { 
            this.total -= 10;
            
        // Number Cards (2-9)
        } else { 
            this.total -= card.value;
        }

        return card;
    }

    public split(new_id:number): Hand {
        const new_hand = new Hand(new_id, this.betbox_id);
        new_hand.primary_bet = this.primary_bet;
        new_hand.isSplitted = true;
        this.isSplitted = true;
        new_hand.isSurrenderEnabled = false;
        new_hand.addCard(this.removeCard());
        return new_hand;
    }

    public print(){
        console.log(
            "BB" + this.betbox_id +
            "H" + (this.id?this.id:0) +
            ": A?" + this.isActive + 
            " B?" + this.isBusted + 
            " BJ?" + this.isBlackJack +
            " F?" + this.isFinished +
            " SpH?" + this.isSplitted + 
            " SpE?" + this.isSplitEnabled + 
            " DD?"+ this.isDoubleDownEnabled + 
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

        this.primary_bet = 25;
        this.secondary_bet = 0;
        this.total = 0;
        this.ace_count = 0;

        this.isActive = false; 
        this.isBusted = false;
        this.isBlackJack = false;
        this.isFinished = false;
        this.isSplitted = false;
        this.isSplitEnabled = false;
        this.isDoubleDownEnabled = true;
        this.isSurrenderEnabled = true;
    }

}
function areCardsSamePointValue(primary_card: Game.Card, secondary_card: Game.Card): boolean {
    return (primary_card.value >= 10 && secondary_card.value >= 10) || (primary_card.value == secondary_card.value);
}
