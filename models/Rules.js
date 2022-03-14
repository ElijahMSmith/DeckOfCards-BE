module.exports = class Rules {
    constructor(initRules) {
        this.excludeDealer = initRules.excludeDealer ?? false;
        this.withoutHearts = initRules.withoutHearts ?? false;
        this.withoutDiamonds = initRules.withoutDiamonds ?? false;
        this.withoutClubs = initRules.withoutClubs ?? false;
        this.withoutSpades = initRules.withoutSpades ?? false;
        this.jokersEnabled = initRules.jokersEnabled ?? false;
        this.autoAbsorbCards = initRules.autoAbsorbCards ?? false;
        this.playFacedDown = initRules.playFacedDown ?? false;
    }
};
