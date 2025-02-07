export class Hand {
    constructor(bet) {
        this.cards = [];
        this.bet = 0;
        this.total = 0;
        this.ace_count = 0;
        this.bet = bet;
    }
    hit(card) {
        // Add card to the list of cards of the hand
        this.cards.push(card);
        // Add the value of the card to the hand value
        if (card.value == 1) { // ACE
            this.ace_count++;
            this.total += 11;
        }
        else if (card.value >= 10) { // Face Card
            this.total += 10;
        }
        else {
            this.total += card.value;
        }
        // Adjust for Aces if total exceeds 21
        while (this.total > 21 && this.ace_count > 0) {
            this.total -= 10;
            this.ace_count--;
        }
    }
    stand() { }
    double() { }
    split() { }
    surrender() { }
    insurance() { }
    print(id) {
        console.log("Hand No. " + (id ? id : 0) + ": Points: " + this.total + " Wager: $" + this.bet + " Cards: " + this.cards.map(card => card.toString(true)).join(" | "));
    }
    getHandValue() {
        if (this.cards.length == 0)
            return "0";
        if (this.total > 21)
            return "💥";
        if (this.ace_count > 0 && this.total <= 21) {
            return this.total.toString() + "/" + (this.total - 10).toString();
        }
        else {
            return this.total.toString();
        }
    }
}
