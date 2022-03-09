const router = require('express').Router();
const Replay = require('../models/Replay');
const User = require('../models/User');
const verifyToken = require('./verifyToken');

// Submit a replay to the database (only from websocket server)
// Add the ID of this replay to the user object for every player connected at any point in time
router.post('/submit', async (req, res) => {
    try {
        // Try to save replay to db, fails if invalid format
        const rep = new Replay(req.body, true);
        await rep.save();

        const savedToUsers = [];

        // Save replay ID to each player's replays list
        for (let playerNoObj of rep.playerIDs) {
            for (let playerID of playerNoObj.allIDs) {
                User.findById(playerID).exec(async function (queryError, user) {
                    if (queryError) return;
                    try {
                        // Add to front of the array and save
                        user.replays.unshift(rep._id);
                        while (user.replays.length > 5) user.replays.pop();
                        await user.save();
                        savedToUsers.push(playerID);
                    } catch (saveError) {
                        return;
                    }
                });
            }
        }

        console.log('Successfully saved replay to the following users:');
        for (let id of savedToUsers) console.log(id);

        res.status(201);
    } catch (error) {
        //console.log(error);
        res.status(400).send({ error: error.message });
    }
});

// Get a replay from the database (any client)
router.get('/retrieve', verifyToken, async (req, res) => {
    if (!req._id || !req.playerID)
        return res.status(400).send({
            error: 'Request missing either the replay ID or the player ID.',
        });

    Replay.findOne({
        _id: req._id,
    }).exec(function (err, rep) {
        if (err)
            return res.status(400).send({
                error: 'The requested replay does not exist.',
            });

        if (!rep.containsPlayerID(req.playerID))
            return res.status(403).send({
                error:
                    'The requestor does not have access to the requested replay.',
            });

        res.status(200).send(rep);
    });
});

module.exports = router;
