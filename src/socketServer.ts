// Socket server
import { Server as httpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import Game from './models/Game';
import HashMap from 'hashmap';
import { Rules } from './models/Rules';

interface ISocket extends Socket {
    playerID?: string;
    username?: string;
    token?: string;
}

interface JwtPayload {
    _id: string;
}

export default (server: httpServer) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    const activeGames = new HashMap();

    io.use((socket: ISocket, next) => {
        try {
            console.log('Verifying ' + socket.handshake.auth.token);
            const data = verify(
                socket.handshake.auth.token,
                process.env.JWT_SECRET
            ) as JwtPayload;
            socket.playerID = data._id;
            socket.token = socket.handshake.auth.token;
            socket.username = socket.handshake.auth.username;
            console.log('Verified!');
            next();
        } catch (error) {
            console.error(error);
            next(new Error('Authentication error'));
        }
    }).on('connection', (socket: ISocket) => {
        // Connection now authenticated to receive further events
        console.log('New connection: ' + socket.id);

        // In the process of leaving, still has access to rooms joined
        socket.on('disconnecting', async () => {
            for (let room of socket.rooms) {
                // Might not be a game room, since all sockets connect to a room with their own ID
                const game = <Game>activeGames.get(room);
                if (game) {
                    const playerNum = game.getPlayerPositionByID(
                        socket.playerID
                    );
                    if (playerNum !== -1) {
                        const returnState = await game.performAction(
                            `L${game.getPlayerPositionByID(socket.playerID)}  `
                        );

                        socket.to(room).emit('update', returnState);

                        if (returnState.terminated) {
                            io.socketsLeave(room);
                            activeGames.delete(room);
                        }
                    }
                }
            }
        });

        // For debugging
        socket.on('test', (args: any[]) => {
            console.log(args);
        });

        // Finished disconnecting, all rooms have been left
        socket.on('disconnect', () => {
            console.log('User disconnected - ' + socket.id);
        });

        // Create a new game with the submitted rules, choosing an unused code
        socket.on('create', async (rules: Rules, callback) => {
            console.log({ event: 'create', rules, callback });
            let build = [];
            let code: string;
            do {
                for (let i = 0; i < 6; i++)
                    build.push(Math.floor(Math.random() * 10));
                code = build.join('');
            } while (activeGames.has(code));
            const newGame = new Game(rules);

            const playerObj = newGame.playerState[1 - 1];
            playerObj.username = socket.username;
            playerObj._id = socket.playerID;
            newGame.playerLog[1 - 1].allIDs.push(socket.playerID);

            activeGames.set(code, newGame);
            socket.join(code);

            await newGame.performAction(`J1  `);
            if (!callback)
                console.error('No callback provided to create event.');
            else
                callback({
                    code,
                    playerNumber: 1,
                    currentState: newGame.getCurrentState(),
                });
        });

        socket.on('join', async (code: string, callback) => {
            console.log({ event: 'join', code });
            const joiningGame: Game = <Game>activeGames.get(code);
            if (!joiningGame) {
                if (!callback)
                    console.error(
                        'No callback provided to join event - invalid game code'
                    );
                else callback({ error: 'Invalid game code!' });
                return;
            }

            const pid = socket.playerID;
            if (joiningGame.blacklistedPlayers.indexOf(pid) !== -1) {
                if (!callback)
                    console.error(
                        'No callback provided to join event - blacklisted player'
                    );
                else
                    callback({
                        error: "You're not allowed to join that game!",
                    });
                return;
            }

            const insertNum = joiningGame.firstOpenPosition();
            if (insertNum === -1) {
                if (!callback)
                    console.error(
                        'No callback provided to join event - game already full'
                    );
                else callback({ error: 'That game is already full!' });
                return;
            }

            const playerObj = joiningGame.playerState[insertNum - 1];
            playerObj.username = socket.username;
            playerObj._id = socket.playerID;
            joiningGame.playerLog[insertNum - 1].allIDs.push(pid);

            const stateForOtherPlayers = await joiningGame.performAction(
                `J${insertNum}  `
            );

            socket.to(code).emit('update', stateForOtherPlayers);
            socket.join(code);

            if (!callback)
                console.error(
                    'No callback provided to join event - successful join'
                );
            else
                callback({
                    currentState: joiningGame.getCurrentState(),
                    playerNumber: insertNum,
                });
        });

        socket.on('action', async (code: string, action: string, callback) => {
            console.log({ event: 'Action', code, action, callback });
            const game = <Game>activeGames.get(code);
            if (!game) {
                if (!callback)
                    console.error(
                        'No callback provided to action event - invalid game code'
                    );
                else callback({ error: 'This game does not exist!' });
                return;
            }

            const pnum = game.getPlayerPositionByID(socket.playerID);
            if (pnum === -1) {
                if (!callback)
                    console.error(
                        'No callback provided to action event - not part of game'
                    );
                else callback({ error: "You haven't joined this game!" });
                return;
            }

            if (action.charAt(0) === 'L' && action.charAt(2) === 'K') {
                console.log('Recognized Kick Action');
                // Player kicked from the game
                // Grab the player's ID, then find their socket
                // Emit a kick event to that user
                // Remove their socket from the room with that game code
                const kickedPlayerNum = parseInt(action.charAt(1));
                if (kickedPlayerNum === NaN) {
                    callback({ error: 'Kicked player number is not valid' });
                    return;
                }

                const kickedID = game.playerState[kickedPlayerNum - 1]._id;

                console.log(
                    'Kicking player ' +
                        kickedPlayerNum +
                        ' with user _id ' +
                        kickedID
                );
                const clients = io.sockets.adapter.rooms.get(code);

                for (let clientid of clients) {
                    const clientSocket: ISocket =
                        io.sockets.sockets.get(clientid);
                    console.log(
                        'SocketID ' +
                            clientid +
                            ' - user _id ' +
                            clientSocket.playerID +
                            ' =? ' +
                            kickedID
                    );
                    if (clientSocket.playerID === kickedID) {
                        // Found
                        console.log('Found!');
                        io.to(clientid).emit('kicked');
                        clientSocket.leave(code);
                        break;
                    }
                }

                // Still play the action below to clean up their player object
            }

            const returnState = await game.performAction(action);
            console.log('Emitting to game ' + code, returnState);
            if (returnState) {
                io.to(code).emit('update', returnState);

                // Make all Socket instances leave the room, which closes it
                if (returnState.terminated) {
                    io.socketsLeave(code);
                    activeGames.delete(code);
                }
            }

            if (!callback)
                console.error(
                    'No callback provided to action event - played successfully'
                );
            else callback({});
        });

        socket.on('clearForTests', () => activeGames.clear());
    });
};
