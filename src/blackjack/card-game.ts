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
import {DiceRoller} from "./dice-roller.js";
export class Card {
  suit: number;
  value: number;
  constructor(suit: number, value: number){
    this.suit = suit;
    this.value = value;
  }
  toString(): string{
    const valueSymbol: { [key: number]: string } = { 1: "A", 10: "T", 11: "J", 12: "Q", 13: "K" };
    const suitSymbols = ["♠","♦","♣","♥"];
    return (valueSymbol[this.value]||this.value)+suitSymbols[this.suit];
  }
}

export class Deck {
  cards: Card[] = [];
  amount_of_cards: number;
  amount_of_cards_used: number;
  constructor() {
    for (let currentSuit = 0; currentSuit <=3 ; currentSuit++)											
      for (let currentValue = 1; currentValue <=13 ; currentValue++)
        this.cards.push(new Card(currentSuit,currentValue));
    this.amount_of_cards = this.cards.length;
    this.amount_of_cards_used = 0;
  }

  public shuffle (die:DiceRoller): void{
    /* Fisher-Yates Modern Version */
    let last_index:number = this.cards.length-1;
    while (last_index > 0){
      let rand_index=die.roll(last_index+1);
      [this.cards[last_index], this.cards[rand_index]] = [this.cards[rand_index], this.cards[last_index]];
      last_index -= 1;
    }
  }

  public draw(): Card | undefined {
    this.amount_of_cards -= 1;
    this.amount_of_cards_used += 1;
    return this.cards.shift();
  }

  print(){
    console.log("Amount of Cards: " + this.amount_of_cards);
    console.log("Amount of Cards Used: " + this.amount_of_cards_used);
    console.log(this.cards.map(card => card.toString()).join(" | "));
  }
}

export class Shoe extends Deck{
  amount_of_decks: number;
  constructor(amount_of_decks:number){
    super();
    this.cards = [];
    this.amount_of_decks = amount_of_decks;
    for(let i=0; i < this.amount_of_decks; i++){
      let new_deck = new Deck();
      this.cards.push(...new_deck.cards);
    }
    this.amount_of_cards = this.cards.length;
  }
}



