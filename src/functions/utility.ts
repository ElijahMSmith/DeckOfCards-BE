import { io } from 'socket.io-client';

export function newSocket(playerNum: number) {
    return io('http://localhost:8080', {
        auth: {
            token:
                playerNum == 1
                    ? process.env.TESTING_TOKEN_1
                    : playerNum == 2
                    ? process.env.TESTING_TOKEN_2
                    : process.env.TESTING_TOKEN_3,
            username:
                playerNum == 1
                    ? process.env.TESTING_USERNAME_1
                    : playerNum == 2
                    ? process.env.TESTING_USERNAME_2
                    : process.env.TESTING_USERNAME_3,
        },
    });
}

export function printClean(obj: any) {
    console.log(JSON.stringify(obj, null, 4));
}
