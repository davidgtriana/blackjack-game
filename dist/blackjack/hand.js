export class Hand {
    betbox_id;
    id;
    cards = [];
    primary_bet;
    secondary_bet;
    isActive;
    isBusted;
    isSplitEnabled;
    isDoubleDownEnabled;
    isSurrenderEnabled;
    total = 0;
    ace_count = 0;
    constructor(id, betbox_id) {
        this.betbox_id = betbox_id;
        this.id = id;
        this.primary_bet = 0;
        this.secondary_bet = 0;
        this.isActive = false;
        this.isBusted = false;
        this.isSplitEnabled = false;
        this.isDoubleDownEnabled = true;
        this.isSurrenderEnabled = true;
    }
    // constructor(hand:Hand){
    //     this.betbox_id = hand.betbox_id;
    //     this.id = hand.id;
    //     this.primary_bet = hand.primary_bet;
    //     this.secondary_bet = 0;
    //     this.isActive = false; // Only activate when dealer checks which BB has a bet or after succesfully split
    //     this.isBusted = false;
    //     this.isSplitEnabled = false;
    //     this.isDoubleDownEnabled = true;
    //     this.isSurrenderEnabled = true;
    // }
    addCard(card) {
        // Add card to the list of cards of the hand
        this.cards.push(card);
        // Check if it can be splittable
        if (this.cards.length == 2)
            this.isSplitEnabled = areCardsSamePointValue(this.cards[0], this.cards[1]);
        // Disable double down and surrender if hand has 3 cards or more
        if (this.cards.length >= 3) {
            this.isDoubleDownEnabled = false;
            this.isSurrenderEnabled = false;
        }
        // Add the value of the card to the hand value
        if (card.value == 1) { // ACE
            this.ace_count++;
            this.total += 11;
        }
        else if (card.value >= 10) { // Face Card
            this.total += 10;
        }
        else { // Number Cards (2-9)
            this.total += card.value;
        }
        // Adjust for Aces if total exceeds 21
        if (this.total > 21 && this.ace_count > 0) {
            this.total -= 10;
            this.ace_count--;
        }
    }
    removeCard() {
        // Since removeCard is only possible when splitting a hand, make it false for that hand
        this.isSplitEnabled = false;
        // Remove the cards of the list of cards
        const card = this.cards.pop();
        // Adjust total value of the hand
        if (card.value == 1) { // Ace handling
            // this.ace_count--;
            // if (this.total > 21) {
            //     this.total -= 1; // If an Ace was already reduced to 1
            // } else {
            //     this.total -= 11; // If it was still counted as 11
            // }
        }
        else if (card.value >= 10) { // Face Card (J, Q, K)
            this.total -= 10;
        }
        else { // Number Cards (2-9)
            this.total -= card.value;
        }
        return card;
    }
    split() {
        const new_hand = new Hand(this.id + 1, this.betbox_id);
        new_hand.primary_bet = this.primary_bet;
        new_hand.addCard(this.removeCard());
        return new_hand;
    }
    print() {
        console.log("BB" + this.betbox_id +
            "H" + (this.id ? this.id : 0) +
            ": A?" + this.isActive +
            " B?" + this.isBusted +
            " S?" + this.isSplitEnabled +
            " DD?" + this.isDoubleDownEnabled +
            " TT" + this.getHandTotal() +
            " B1$" + this.primary_bet + " B2$" + this.secondary_bet +
            " C: " + this.cards.map(card => card.toString(true)).join(" | "));
    }
    setBet(bet) {
        this.primary_bet = bet;
    }
    getHandTotal() {
        if (this.cards.length == 0)
            return "0";
        if (this.total > 21)
            return "💥";
        if (this.total == 21 && this.cards.length == 2) {
            return "BJ";
        }
        else if (this.id > 1) {
            return this.total.toString();
        }
        if (this.isSoft() && this.isActive) {
            return this.total.toString() + "/" + (this.total - 10).toString();
        }
        else {
            return this.total.toString();
        }
    }
    isSoft() {
        return this.total <= 21 && this.ace_count > 0;
    }
    reset() {
        this.cards = [];
        this.total = 0;
        this.ace_count = 0;
        this.primary_bet = 0;
        this.isActive = false;
    }
}
function areCardsSamePointValue(primary_card, secondary_card) {
    return (primary_card.value >= 10 && secondary_card.value >= 10) || (primary_card.value == secondary_card.value);
}
