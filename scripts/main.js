var Card = /** @class */ (function () {
    function Card(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    Object.defineProperty(Card.prototype, "getCard", {
        get: function () {
            return this.getNumberSymbol(this.value) + this.getSuitSymbol(this.suit);
        },
        enumerable: false,
        configurable: true
    });
    Card.prototype.getSuitSymbol = function (suit) {
        var suitSymbols = ["♠", "♦", "♣", "♥"];
        return suitSymbols[suit];
    };
    Card.prototype.getNumberSymbol = function (value) {
        if (value == 1)
            return "A";
        if (value == 10)
            return "T";
        if (value == 11)
            return "J";
        if (value == 12)
            return "Q";
        if (value == 13)
            return "K";
        return value.toString();
    };
    return Card;
}());
var Deck = /** @class */ (function () {
    function Deck() {
        this.cards = [];
        this.init();
    }
    Deck.prototype.init = function () {
        for (var currentSuit = 0; currentSuit <= 3; currentSuit++)
            for (var currentValue = 1; currentValue <= 13; currentValue++)
                this.cards.push(new Card(currentSuit, currentValue));
    };
    return Deck;
}());
var deck = new Deck();
for (var i = 0; i < 52; i++)
    console.log(deck.cards[i].getCard);
