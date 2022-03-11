const Replay = require('../models/Replay');
const User = require('../models/User');

// Submit a replay to the database (only from websocket server)
// Add the ID of this replay to the user object for every player connected at any point in time
module.exports.submitToDB = async function (replayObject) {
    try {
        // Try to save replay to db, fails if invalid format
        const rep = new Replay(replayObject, true);
        await rep.save();

        console.log('Replay saved successfully!');

        const savedToUsers = [];

        // Save replay ID to each player's replays list
        for (let playerNoObj of rep.playerIDs) {
            for (let playerID of playerNoObj.allIDs) {
                if (savedToUsers.indexOf(playerID) !== -1) continue;

                User.findById(playerID).exec(async function (queryError, user) {
                    if (queryError) return queryError;
                    try {
                        // Add to front of the array and save
                        user.replays.unshift(rep._id);
                        while (user.replays.length > 5) user.replays.pop();
                        await user.save();
                        console.log("Pushing to player '" + playerID + "'");
                        savedToUsers.push(playerID);
                    } catch (saveError) {
                        return saveError;
                    }
                });
            }
        }
        return null;
    } catch (error) {
        return error;
    }
};
