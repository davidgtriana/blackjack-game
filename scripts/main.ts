
class Card {
  /* SUIT: 
    - 0 == ♠ SPADES
    - 1 == ♦ DIAMONDS
    - 2 == ♣ CLUBS
    - 3 == ♥ HEARTS

      VALUE:
    - 1 == (A) ACE
    - 2 - 9 == ITS Value
    - 10 == (T) TEN
    - 11 == (J) JACK
    - 12 == (Q) QUEEN
    - 13 == (K) KING
    */
  suit: number;
  value: number;
  constructor(suit: number, value: number){
    this.suit = suit;
    this.value = value;
  }

  get getCard():string{
    
    return this.getNumberSymbol(this.value)+this.getSuitSymbol(this.suit);
  }

  private getSuitSymbol(suit: number): string{
    const suitSymbols = ["♠","♦","♣","♥"];
    return suitSymbols[suit];
  }
  private getNumberSymbol(value: number): string{
    if (value==1) return "A";
    if (value==10) return "T";
    if (value==11) return "J";
    if (value==12) return "Q";
    if (value==13) return "K";
    return value.toString();
  }
}
class Deck {
  cards: Card[] = [];
  constructor() {
    this.init();
  }
  
  private init (): void{
    for (let currentSuit = 0; currentSuit <=3 ; currentSuit++)											
      for (let currentValue = 1; currentValue <=13 ; currentValue++)
        this.cards.push(new Card(currentSuit,currentValue));
  }
}

let deck = new Deck();

for (let i=0; i<52; i++)
  console.log(deck.cards[i].getCard);

  




