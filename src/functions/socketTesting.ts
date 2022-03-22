import io from 'socket.io-client';

const socket = io('http://localhost:8080', {
    auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjJhNzZhNjlkZmQyZjMyNDEyMTNmOTYiLCJpYXQiOjE2NDY5NTAwNTR9.luPzsNJaK9GWKLHKsvCukcHJGJyNczzqf_1BZg4q_ps',
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
