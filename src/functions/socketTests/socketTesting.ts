import io from 'socket.io-client';
import dotenv = require('dotenv');
dotenv.config();

const socket = io('http://localhost:8080', {
    auth: {
        token: process.env.TESTING_TOKEN,
    },
});

socket.on('connect', () => {
    console.log(socket.id + ' connected to server!');
    setTimeout(() => {
        socket.emit('test', { testData: 1, testData2: 2 });
    }, 1000);

    setTimeout(() => {
        socket.emit('test', { hello: 'world' });
    }, 3000);
});
