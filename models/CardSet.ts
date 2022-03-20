import { Card } from './Card';

export class CardSet {
    contents: Card[] = []; // [Card]

    // initialState = [char]
    constructor(initContents: string[] = []) {
        for (let cardCode of initContents)
            this.contents.push(new Card(cardCode));
    }

    // times = Number
    shuffle(times: number = this.contents.length * 3): void {
        while (times > 0) {
            const rand1 = Math.floor(Math.random() * this.contents.length);
            const rand2 = Math.floor(Math.random() * this.contents.length);
            const temp = this.contents[rand1];
            this.contents[rand1] = this.contents[rand2];
            this.contents[rand2] = temp;
        }
    }

    hideAll(): void {
        for (let card of this.contents) card.revealed = false;
    }

    revealAll(): void {
        for (let card of this.contents) card.revealed = true;
    }

    // val = char (what to find)
    indexOf(val: string): number {
        for (let i = 0; i < this.contents.length; i++)
            if (this.contents[i].value === val) return i;
        return -1;
    }

    // toReveal = char (value)
    // returns whether the card was found or not
    revealCard(toReveal: string): boolean {
        const index = this.indexOf(toReveal);
        if (index === -1) return false;

        this.contents[index].revealed = !this.contents[index].revealed;
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
    insertCard(card: Card, position: number = this.contents.length): void {
        card.revealed = false;
        this.contents.splice(position ?? this.contents.length, 0, card);
    }

    toString(): string {
        return this.contents.reduce(
            (previousValue, currentCard) => previousValue + currentCard.value,
            ''
        );
    }

    length(): number {
        return this.contents.length;
    }

    combineInto(other: CardSet): void {
        other.contents = other.contents.concat(this.contents);
    }

    clear(): void {
        this.contents = [];
    }
}
