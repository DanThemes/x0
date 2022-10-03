const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');

app.use(cors());

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

io.engine.on('connection_error', err => {
  console.log(err);
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Invalid username.'))
  }
  socket.username = username;
  next();
})

io.on('connection', socket => {
  const users = [];

  for (let [id, socket] of io.of('/').sockets) {
    users.push({
      id: id,
      username: socket.username
    })
  }

  console.log(`Socket id ${socket.id}`)

  socket.emit('users', users);

  // socket.on('send_challenge', data => {
  //   socket.to(data).emit('receive_challenge', { username: socket.username})
  // })

  // socket.on('respond_to_challenge', data => {
  //   if (data.answer) {
  //     socket.to(data.challenger).emit('start_game', data);
  //   } else {
  //     socket.to(data.challenger).emit('refused_to_play', data);
  //   }
  // })

  // socket.on('join_room', room => {
  //   socket.join(room);

  //   console.log(`${socket.username} has joined room: ${room}`)
  // })

 
});





app.get('/', (req, res) => {
  res.send('Nothing to see here.');
})

server.listen(3001, () => {
  console.log('Server is running...');
})