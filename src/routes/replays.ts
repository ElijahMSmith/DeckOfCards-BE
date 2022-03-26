import Replay from '../models/Replay';
import verifyToken from './verifyToken';
const router = require('express').Router();

// Get a replay from the database (any client)
router.get('/retrieve', verifyToken, async (req, res) => {
    const replayID = req.body._id;
    const playerID = req.body.playerID;

    console.log('rid: ' + replayID);
    console.log('pid: ' + playerID);

    if (!replayID || !playerID)
        return res.status(400).send({
            error: 'Request missing either the replay ID or the player ID.',
        });

    Replay.findOne({
        _id: replayID,
    }).exec(function (err, rep) {
        if (err)
            return res.status(400).send({
                error: 'The requested replay does not exist.',
            });

        if (!rep.containsPlayerID(playerID))
            return res.status(403).send({
                error: 'The requestor does not have access to the requested replay.',
            });

        res.status(200).send(rep);
    });
});

export default router;