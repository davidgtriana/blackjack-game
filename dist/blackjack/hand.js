export class Hand {
    constructor(bet) {
        this.cards = [];
        this.cards_value = 0;
        this.bet = 0;
        this.bet = bet;
    }
    hit(card) {
        this.cards.push(card);
        this.cards_value += card.value;
    }
    stand() { }
    double() { }
    split() { }
    surrender() { }
    insurance() { }
}
