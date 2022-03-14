const Card = require('./Card');

module.exports = class CardSet {
    contents = []; // [Card]
    revealed = []; // [boolean]

    // initialState = [char]
    constructor(initialState) {
        let index = 0;
        for (let cardCode of initialState) {
            this.contents.push(new Card(cardCode, index++));
            this.revealed.push(false);
        }
    }

    // times = Number
    shuffle(times = this.contents.length * 2) {
        while (times > 0) {
            const rand1 = Math.floor(Math.random() * this.contents.length);
            const rand2 = Math.floor(Math.random() * this.contents.length);
            const temp = this.contents[rand1];
            this.contents[rand1] = this.contents[rand2];
            this.contents[rand2] = temp;
        }
    }

    // toRemove = Number (position) | char (value)
    removeCard(toRemove) {
        if (typeof toRemove === 'number') {
        } else {
            // char
        }
    }

    // value = char
    // position = Number (optional)
    insertCard(value, position = this.contents.length) {
        this.contents.splice(position, 0, new Card(value, position));
        this.revealed.splice(position, 0, false);
    }
};
