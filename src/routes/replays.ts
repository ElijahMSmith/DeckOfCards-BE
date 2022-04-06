import { verify } from 'jsonwebtoken';
import Replay from '../models/Replay';
import User from '../models/User';
import verifyToken from './verifyToken';
const router = require('express').Router();

// Get a replay from the database (any client)
router.get('/retrieve', verifyToken, async (req, res) => {
    const replayID = req.body._id;
    const playerID = req.body.playerID;

    console.log('rid: ' + replayID);
    console.log('pid: ' + playerID);

    if (!replayID || !playerID) {
        console.log('Error 400 - replay or playerID missing');
        return res.status(400).send({
            error: 'Request missing either the replay ID or the player ID.',
        });
    }

    Replay.findOne({
        _id: replayID,
    }).exec(function (err, rep) {
        if (err) {
            console.log('Error 400 - find replay\n' + err);
            return res.status(400).send({
                error: 'The requested replay does not exist.',
            });
        }

        if (!rep.containsPlayerID(playerID)) {
            console.log('Error 403 - not allowed to access this replay');
            return res.status(403).send({
                error: 'The requestor does not have access to the requested replay.',
            });
        }

        res.status(200).send(rep);
    });
});

router.post('/clear', verifyToken, async (req, res) => {
    Replay.deleteMany({}, (err) => {
        if (err) return res.status(400).send({ error: err });
        User.updateMany({}, { replays: [] }, (err) => {
            if (err) return res.status(400).send({ error: err });
            return res.status(200).send();
        });
    });
});

export default router;
