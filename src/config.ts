export class GameConfig {
    static MAX_HANDS: number = 4;
    static MAX_BET_BOXES: number = 9;
    static MAX_BET_BOXES_PER_PLAYER: number = 2;
    static BET_BOXES_AMOUNT: number = 4;
    static DECKS_PER_SHOE: number = 6;
    static DECK_PENETRATION: number = 0.50;
    static MAX_BET: number = 750;
    static MIN_BET: number = 25;
        
    static IS_EUROPEAN_NO_HOLE_CARD: boolean = true;
    static IS_HIT_17: boolean = true;
    static IS_ALLOWED_SURRENDER: boolean = true;
    static IS_ALLOWED_DOUBLE_AFTER_SPLIT: boolean = true;
    static IS_ORIGINAL_BET_ONLY: boolean = true;

    constructor(){
        
    }
}