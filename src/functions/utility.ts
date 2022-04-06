import { io } from 'socket.io-client';

export function newSocket(userNum: number) {
    return io('http://localhost:8080', {
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
}

export function printClean(obj: any) {
    console.log(JSON.stringify(obj, null, 4));
}
