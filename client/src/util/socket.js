import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: true,

  // withCredentials: true,
  // transports: ['polling', 'websocket']
});

export default socket;