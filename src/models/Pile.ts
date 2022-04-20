import { Card } from './Card';
import { CardSet } from './CardSet';

export class Pile extends CardSet {
    pileID: string;
    faceUp: boolean;

    constructor(pileID: string, faceUp: boolean = false) {
        super();
        if (faceUp) this.revealAll();
        this.faceUp = faceUp;
        this.pileID = pileID;
    }

    addToTop(card: Card): void {
        this.insertCard(card, this.faceUp);
    }

    removeFromTop(): Card {
        return this.contents.pop();
    }
}
