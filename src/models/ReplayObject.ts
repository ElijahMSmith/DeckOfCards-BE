import { PlayerLogData } from './Game';
import { Rules } from './Rules';

export class ReplayObject {
    dateCreated: Date = new Date();
    playerIDs: PlayerLogData[];
    deckArrangements: string[];
    actionLog: string;

    excludeDealer?: boolean;

    withoutHearts?: boolean;
    withoutDiamonds?: boolean;
    withoutClubs?: boolean;
    withoutSpades?: boolean;

    jokersEnabled?: boolean;
    autoAbsorbCards?: boolean;
    playFacedDown?: boolean;

    constructor(
        playerIDs: PlayerLogData[],
        deckArrangements: string[],
        actionLog: string,
        rules: Rules
    ) {
        this.playerIDs = playerIDs;
        this.deckArrangements = deckArrangements;
        this.actionLog = actionLog;

        this.excludeDealer = rules.excludeDealer;

        this.withoutHearts = rules.withoutHearts;
        this.withoutDiamonds = rules.withoutDiamonds;
        this.withoutClubs = rules.withoutClubs;
        this.withoutSpades = rules.withoutSpades;

        this.jokersEnabled = rules.jokersEnabled;
        this.autoAbsorbCards = rules.autoAbsorbCards;
        this.playFacedDown = rules.playFacedDown;
    }
}
