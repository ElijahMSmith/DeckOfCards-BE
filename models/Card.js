module.exports = class Card {
    value; // A-Za-z+-
    numericVal;
    position; // 0, 1, ...

    constructor(val, pos) {
        this.value = val;
        this.position = pos;
        this.numericVal = this.getNumericVal(val);
        this.suit = this.getSuit(val);
    }

    // 1-13, A-M, 65-77 = hearts
    // 14-26, N-Z, 78-90 = diamonds
    // 27-39, a-m, 97-109 = clubs
    // 40-52, n-z, 110-122 = spades
    getSuit() {
        const code = this.value.charCodeAt(0);
        switch (code) {
            case code >= 110:
                return 'Spades';
            case code >= 97:
                return 'Clubs';
            case code >= 78:
                return 'Diamonds';
            default:
                return 'Hearts';
        }
    }

    // Ace = 1, 2, 3, ..., 10, Jack = 11, ...
    getNumericVal() {
        const code = this.value.charCodeAt(0);
        const fromZero = (code >= 97 ? code - 6 : code) - 65;
        return (fromZero % 13) + 1;
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
};
