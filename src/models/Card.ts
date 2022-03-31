export class Card {
    value: string; // A-Za-z+-
    numericVal: number; // 1-13
    suit: string; // Spades, Clubs, Diamonds, Hearts
    revealed: boolean = false;

    constructor(val: string) {
        this.value = val;
        this.numericVal = this.getNumericVal();
        this.suit = this.getSuit();
    }

    // 1-13, A-M, 65-77 = hearts
    // 14-26, N-Z, 78-90 = diamonds
    // 27-39, a-m, 97-109 = clubs
    // 40-52, n-z, 110-122 = spades
    // +/- joker, no suit
    getSuit() {
        if (this.value === '+' || this.value === '-') return 'No Suit';
        const code = this.value.charCodeAt(0);
        if (code >= 110) return 'Spades';
        else if (code >= 97) return 'Clubs';
        else if (code >= 78) return 'Diamonds';
        else return 'Hearts';
    }

    // Ace = 1, 2, 3, ..., 10, Jack = 11, Queen = 12, King = 13
    getNumericVal() {
        if (this.value === '+' || this.value === '-') return 0;
        const code = this.value.charCodeAt(0);
        const fromZero = (code >= 97 ? code - 6 : code) - 65;
        return (fromZero % 13) + 1;
    }

    hide() {
        this.revealed = false;
    }

    show() {
        this.revealed = true;
    }

    toString() {
        if (this.value === '+') return 'Joker 1';
        else if (this.value === '-') return 'Joker 2';

        const val = this.getNumericVal();
        const suit = this.getSuit();
        let build = '';

        if (val === 1) build += 'Ace';
        else if (val === 11) build += 'Jack';
        else if (val === 12) build += 'Queen';
        else if (val === 13) build += 'King';
        else build += val;

        return `${build} of ${suit}`;
    }
}
