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
        if (this.faceUp) card.show();
        else card.hide();
    }

    removeFromTop(): Card {
        return this.contents.pop();
    }
}
