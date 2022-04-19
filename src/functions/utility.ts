import { io } from 'socket.io-client';

export function newSocket(userNum: number) {
    const prod = 'https://mobiledeckofcards.azurewebsites.net';
    const local = 'http://localhost:8080';
    const newSocket = io(local, {
        auth: {
            token:
                userNum === 1
                    ? process.env.TESTING_TOKEN_1
                    : userNum === 2
                    ? process.env.TESTING_TOKEN_2
                    : userNum === 3
                    ? process.env.TESTING_TOKEN_3
                    : process.env.TESTING_TOKEN_4,
            username:
                userNum === 1
                    ? process.env.TESTING_USERNAME_1
                    : userNum === 2
                    ? process.env.TESTING_USERNAME_2
                    : userNum === 3
                    ? process.env.TESTING_USERNAME_3
                    : process.env.TESTING_USERNAME_4,
        },
    });
    return newSocket;
}

export function printClean(obj: any) {
    console.log(JSON.stringify(obj, null, 4));
}
