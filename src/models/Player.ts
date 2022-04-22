import { Card } from './Card';
import { CardSet } from './CardSet';

export class Player {
    hand: CardSet;
    table: CardSet;
    username: string;
    _id: string;

    constructor(initialHand?: CardSet, initialTable?: CardSet) {
        this.hand = initialHand ?? new CardSet([]);
        this.table = initialTable ?? new CardSet([]);
    }

    removeCard(value: string) {
        let removed: Card = this.hand.removeCard(value);
        if (!removed) removed = this.table.removeCard(value);
        return removed;
    }

    receiveCard(card: Card) {
        this.hand.insertCard(card, false);
    }

    vacant(): boolean {
        return !this._id;
    }

    cleanUp(autoAbsorb = false): CardSet {
        this._id = undefined;
        this.username = undefined;
        return autoAbsorb ? this.absorbCards() : null;
    }

    absorbCards(): CardSet {
        const merged = CardSet.merge(this.hand, this.table);
        this.hand.clear();
        this.table.clear();
        return merged;
    }
}
