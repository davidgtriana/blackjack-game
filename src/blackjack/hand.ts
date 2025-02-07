import * as Game from "./card-game.js";

export class Hand{
    cards: Game.Card[] = [];
    cards_value: number = 0;
    bet: number = 0;
    
    constructor(bet:number){
        this.bet = bet;
    }

    public hit(card:Game.Card): void{
        this.cards.push(card);
        this.cards_value += card.value;
    }

    public stand(): void{}
    public double(): void{}
    public split(): void{}
    public surrender(): void{}
    public insurance(): void{}
}