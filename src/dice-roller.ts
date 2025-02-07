export class DiceRoller {
    private seed: number;

    constructor(seed?: number) {
        this.seed = seed ?? Math.floor(Math.random() * 2 ** 32);
    }

    public roll(A: number, B?: number): number{
        return B == undefined ? Math.floor(this.random()*A) : Math.floor(A+this.random()*(B-A));
    }
   
    get getSeed() {
        return this.seed;
    }

    // Returns a number between 0 and 1, 1 not included
    private random(): number {
      this.seed |= 0; 
      this.seed = (this.seed + 0x6D2B79F5) | 0;
      let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}
    
  