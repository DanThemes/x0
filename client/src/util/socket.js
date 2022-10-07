import io from 'socket.io-client';

const socket = io('https://sleepy-blue-macaw.cyclic.app', {
  autoConnect: false,

  withCredentials: true,
  // transports: ['polling', 'websocket']
});

export default socket;