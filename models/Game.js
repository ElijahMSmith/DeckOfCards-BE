const Rules = require('./Rules');

class Game {
    started = false;
    rules;
    deck;
    faceUp;
    discard;
    playerState;

    constructor(rules) {
        this.rules = new Rules(rules);
        if(!rules.withoutHearts)
    }

    excludeDealer = false;
    withoutHearts = false;
    withoutDiamonds = false;
    withoutClubs = false;
    withoutSpades = false;
    jokersEnabled = false;
    autoAbsorbCards = false;
}

class Player {}

module.exports = {};
