const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;

const replaySchema = mongoose.Schema({
    // ------------- Required fields -------------

    // Date the game was played and finished
    dateCreated: {
        type: Date,
        required: true,
    },

    // Replays that were submitted with invalid data are "invalid"
    invalid: {
        type: Boolean,
        default: false,
    },

    // A record of which players are connected as each player number
    // Player number = index + 1
    playerIDs: {
        type: [
            {
                allIDs: {
                    type: [ObjectId],
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
    initialDealer: {
        type: Number,
        default: 1,
    },
    autoAbsorbCards: {
        type: Boolean,
        default: false,
    },
});

/*
playerIDs: {
        type: [{
            allIDs: {
                type: [ObjectId],
                required: true,
            },
        }],
        minLength: 8,
        maxLength: 8,
        required: true,
    },
*/

// Is a specific player ID in this replay's playerIDs array anywhere
replaySchema.methods.containsPlayerID = function (queryingID) {
    const replay = this;
    try {
        for (let playerNoObj of replay.playerIDs) {
            for (let playerID of playerNoObj.allIDs) {
                if (playerID == queryingID) return true;
            }
        }

        return false;
    } catch (err) {
        return false;
    }
};

const Replay = mongoose.model('Replay', replaySchema);
module.exports = Replay;
