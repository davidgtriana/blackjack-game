import * as Game from "./card-game.js";

export class Hand{
    cards: Game.Card[] = [];
    cards_value: number = 0;
    bet: number = 0;
    
    constructor(bet:number){
        this.bet = bet;
    }

    public hit(card:Game.Card): void{
        const card_values_bj: { [key: number]: number } = {11: 10, 12: 10, 13: 10};
        this.cards_value += card_values_bj[card.value]||card.value;
        this.cards.push(card);
    }

    public stand(): void{}
    public double(): void{}
    public split(): void{}
    public surrender(): void{}
    public insurance(): void{}

    public print(id?:number){
        console.log("Hand No. "+(id?id:0)+ ": Points: " + this.cards_value + " Wager: $" + this.bet + " Cards: " + this.cards.map(card => card.toString(true)).join(" | "));
    }
}