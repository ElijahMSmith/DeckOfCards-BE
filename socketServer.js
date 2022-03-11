// Socket server
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

module.exports = function createSocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    io.engine.on('connection_error', (err) => {
        console.log('Server error');
        console.log(err);
    });

    io.use((socket, next) => {
        try {
            const data = jwt.verify(
                socket.handshake.auth.token,
                process.env.JWT_SECRET
            );
            socket.playerID = data._id;
            socket.token = socket.handshake.auth.token;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    }).on('connection', (socket) => {
        // Connection now authenticated to receive further events
        console.log('New connection: ' + socket.id);
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('test', (data) => {
            console.log('data: ', data);
        });
    });

    setInterval(async () => {
        const all = await io.sockets.allSockets();
        console.log('Currently connected sockets:');
        for (let socket of all) console.log(socket);
    }, 15000);
};
