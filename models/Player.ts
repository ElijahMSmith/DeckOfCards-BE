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
        this.hand.insertCard(card);
    }

    vacant(): boolean {
        return !this.username && !this._id;
    }
}
