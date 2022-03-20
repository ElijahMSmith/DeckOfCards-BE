import { Card } from './Card';
import { CardSet } from './CardSet';

export class Pile extends CardSet {
    pileID: string;
    faceUp: boolean;

    constructor(pileID: string, faceUp: boolean = false) {
        super();
        if (faceUp) this.revealAll();
        this.pileID = pileID;
    }

    addToTop(card: Card): void {
        this.insertCard(card);
        if (this.faceUp) card.revealed = true;
        else card.revealed = false;
    }

    removeFromTop(): Card | null {
        return this.contents.length === 0
            ? null
            : this.contents.splice(0, 1)[0];
    }
}
