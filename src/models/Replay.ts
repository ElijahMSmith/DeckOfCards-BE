import { Schema, model, Types } from 'mongoose';

class PlayersByPosition {
    allIDs: Types.ObjectId[];
}

interface IReplay {
    dateCreated: Date;
    playerIDs: PlayersByPosition[];
    deckArrangements: string[];
    actionLog: string;

    excludeDealer: boolean;

    withoutHearts: boolean;
    withoutDiamonds: boolean;
    withoutClubs: boolean;
    withoutSpades: boolean;

    jokersEnabled: boolean;
    autoAbsorbCards: boolean;
    playFacedDown: boolean;

    containsPlayerID(id: Types.ObjectId): boolean;
}

const replaySchema = new Schema<IReplay>({
    // ------------- Required fields -------------

    // Date the game was played and finished
    dateCreated: {
        type: Date,
        required: true,
    },

    // A record of which players are connected as each player number
    // Player number = index + 1
    // This looks dumb, but there appears to be no 2D array support in Mongoose
    playerIDs: {
        type: [
            {
                allIDs: {
                    type: [Types.ObjectId],
                    required: true,
                },
            },
        ],
        minLength: 8,
        maxLength: 8,
        required: true,
    },

    // The arrangement of all cards in the deck
    // First index is at the start of the game, each afterwards is the next time the deck is shuffled
    deckArrangements: {
        type: [String],
        required: true,
        minLength: 1,
    },

    // Each action is a four character code that gives all the info needed to perform it
    actionLog: {
        type: String,
        required: true,
    },

    // ------------- Options -------------

    excludeDealer: {
        type: Boolean,
        default: false,
    },

    withoutHearts: {
        type: Boolean,
        default: false,
    },
    withoutDiamonds: {
        type: Boolean,
        default: false,
    },
    withoutClubs: {
        type: Boolean,
        default: false,
    },
    withoutSpades: {
        type: Boolean,
        default: false,
    },

    jokersEnabled: {
        type: Boolean,
        default: false,
    },
    autoAbsorbCards: {
        type: Boolean,
        default: false,
    },
    playFacedDown: {
        type: Boolean,
        default: false,
    },
});

// Is a specific player ID in this replay's playerIDs array anywhere
replaySchema.methods.containsPlayerID = function (
    queryingID: Types.ObjectId
): boolean {
    const replay: IReplay = this;
    try {
        for (let playerNoObj of replay.playerIDs) {
            for (let playerID of playerNoObj.allIDs) {
                console.log("'" + playerID + "' vs '" + queryingID + "'");
                if (playerID === queryingID) return true;
            }
        }

        return false;
    } catch (err) {
        return false;
    }
};

const Replay = model<IReplay>('Replay', replaySchema);
export default Replay;
