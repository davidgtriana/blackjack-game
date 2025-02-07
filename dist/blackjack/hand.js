export class Hand {
    constructor(bet) {
        this.cards = [];
        this.cards_value = 0;
        this.bet = 0;
        this.bet = bet;
    }
    hit(card) {
        const card_values_bj = { 11: 10, 12: 10, 13: 10 };
        this.cards_value += card_values_bj[card.value] || card.value;
        this.cards.push(card);
    }
    stand() { }
    double() { }
    split() { }
    surrender() { }
    insurance() { }
    print(id) {
        console.log("Hand No. " + (id ? id : 0) + ": Points: " + this.cards_value + " Wager: $" + this.bet + " Cards: " + this.cards.map(card => card.toString(true)).join(" | "));
    }
}
