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
    Deck.prototype.shuffle = function () {
        /* Fisher-Yates Modern Version */
        var last_index = this.cards.length - 1;
        while (last_index > 0) {
            var rand_index = Math.floor(Math.random() * last_index + 1);
            var temp = this.cards[last_index];
            this.cards[last_index] = this.cards[rand_index];
            this.cards[rand_index] = temp;
            last_index -= 1;
        }
    };
    return Deck;
}());
var deck = new Deck();
deck.shuffle();
for (var i = 0; i < deck.cards.length; i++)
    console.log(i + " : " + deck.cards[i].getCard);
