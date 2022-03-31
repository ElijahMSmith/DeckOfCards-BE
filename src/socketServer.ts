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
            const data = verify(
                socket.handshake.auth.token,
                process.env.JWT_SECRET
            ) as JwtPayload;
            socket.playerID = data._id;
            socket.token = socket.handshake.auth.token;
            socket.username = socket.handshake.auth.username;
            next();
        } catch (error) {
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
            let code: string;
            do {
                code = Math.floor(Math.random() * 1000000).toString();
            } while (activeGames.has(code));
            const newGame = new Game(rules);

            const playerObj = newGame.playerState[1 - 1];
            playerObj.username = socket.username;
            playerObj._id = socket.playerID;
            newGame.playerLog[1 - 1].allIDs.push(socket.playerID);

            activeGames.set(code, newGame);
            socket.join(code);
            await newGame.performAction(`J1  `);
            callback({
                code,
                playerNumber: 1,
                currentState: newGame.getCurrentState(),
            });
        });

        socket.on('joinGame', async (code: string, callback) => {
            console.log({ event: 'joinGame', code });
            const joiningGame: Game = <Game>activeGames.get(code);
            if (!joiningGame) {
                callback({ error: 'Invalid game code!' });
                return;
            }

            const pid = socket.playerID;
            if (joiningGame.blacklistedPlayers.indexOf(pid) !== -1) {
                callback({ error: "You're not allowed to join that game!" });
                return;
            }

            const insertNum = joiningGame.firstOpenPosition();
            if (insertNum === -1) {
                callback({ error: 'That game is already full!' });
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
            callback({
                currentState: joiningGame.getCurrentState(),
                playerNumber: insertNum,
            });
        });

        socket.on('action', async (code: string, action: string, callback) => {
            console.log({ event: 'Action', code, action });
            const game = <Game>activeGames.get(code);
            if (!game) {
                callback({ error: 'This game does not exist!' });
                return;
            }

            const pnum = game.getPlayerPositionByID(socket.playerID);
            if (pnum === -1) {
                callback({ error: "You haven't joined this game!" });
                return;
            }

            const returnState = await game.performAction(action);
            io.to(code).emit('update', returnState);

            // Make all Socket instances leave the room, which closes it
            if (returnState.terminated) {
                io.socketsLeave(code);
                activeGames.delete(code);
            }
        });

        socket.on('clearForTests', () => activeGames.clear);
    });
};
