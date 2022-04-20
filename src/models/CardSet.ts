import { Card } from './Card';

export class CardSet {
    contents: Card[] = []; // [Card]

    // initialState = [char]
    constructor(initContents: string[] = []) {
        for (let cardCode of initContents)
            this.contents.push(new Card(cardCode));
    }

    // times = Number
    shuffle(times: number = this.contents.length * 5): void {
        while (--times > 0) {
            const rand1 = Math.floor(Math.random() * this.contents.length);
            const rand2 = Math.floor(Math.random() * this.contents.length);
            const temp = this.contents[rand1];
            this.contents[rand1] = this.contents[rand2];
            this.contents[rand2] = temp;
        }
    }

    hideAll(): void {
        for (let card of this.contents) card.hide();
    }

    revealAll(): void {
        for (let card of this.contents) card.show();
    }

    // val = char (what to find)
    indexOf(val: string): number {
        for (let i = 0; i < this.contents.length; i++)
            if (this.contents[i].value === val) return i;
        return -1;
    }

    // toToggle = char (value)
    // returns whether the card was found or not
    toggleCard(toToggle: string): boolean {
        const index = this.indexOf(toToggle);
        if (index === -1) return false;

        this.contents[index].toggleShowing();
        return true;
    }

    // toReveal = char (value)
    // returns whether the card was found or not
    revealCard(toReveal: string): boolean {
        const index = this.indexOf(toReveal);
        if (index === -1) return false;

        this.contents[index].show();
        return true;
    }

    // toHide = char (value)
    // returns whether the card was found or not
    hideCard(toHide: string): boolean {
        const index = this.indexOf(toHide);
        if (index === -1) return false;

        this.contents[index].hide();
        return true;
    }

    // toRemove = char (value)
    // Returns the card object removed
    removeCard(toRemove: string): Card {
        const index = this.indexOf(toRemove);
        return index === -1 ? null : this.contents.splice(index, 1)[0];
    }

    // value = char
    // position = Number (optional)
    insertCard(
        card: Card,
        showing = false,
        position: number = this.contents.length
    ): void {
        if (showing) card.show();
        else card.hide();
        this.contents.splice(position ?? this.contents.length, 0, card);
    }

    toString(): string {
        return this.contents.reduce(
            (previousValue, currentCard) => previousValue + currentCard.value,
            ''
        );
    }

    size(): number {
        return this.contents.length;
    }

    combineInto(other: CardSet): void {
        other.contents = other.contents.concat(this.contents);
        this.clear();
    }

    static merge(set1: CardSet, set2: CardSet): CardSet {
        const merged = new CardSet();
        merged.contents = set1.contents.concat(set2.contents);
        return merged;
    }

    clear(): void {
        this.contents = [];
    }
}
