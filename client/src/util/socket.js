import io from 'socket.io-client';

const socket = io('https://tictactoe-nodejs.onrender.com', {
  autoConnect: false,

  withCredentials: true,
  transports: ['polling', 'websocket']
});

export default socket;