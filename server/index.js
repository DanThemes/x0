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
  const usersList = [];

  for (let [id, socket] of io.of('/').sockets) {
    usersList.push({
      id: id,
      username: socket.username
    })
  }

  console.log(`Socket id ${socket.id}`)

  io.emit('users', usersList);

  socket.on('send_challenge', data => {
    console.log(`${data.playerOne.username} send a challenge to ${data.playerTwo.username}`);

    socket.to(data.playerTwo.id).emit('receive_challenge', data)
  })

  socket.on('join_room', room => {
    socket.join(room);

    console.log(`${socket.username} has joined room: ${room}`)
  })

  socket.on('respond_to_challenge', data => {
    console.log(data);
    
    // if playerTwo accepted, start the game
    if (data.answer) {
      io.to(data.playerOne.id).emit('start_game', data);
    } 
    
    // if playerTwo refused, emit a refused_to_play event
    else {
      io.to(data.playerOne.id).emit('refused_to_play', data);
    }
  })

  socket.on('update_game', data => {
    io.to(data.playerOne.id).emit('update_game', data);
  });

  socket.on('game_over', data => {
    io.to(data.room).emit('game_over', data.winner);
  })



 
});





app.get('/', (req, res) => {
  res.send('Nothing to see here.');
})

server.listen(3001, () => {
  console.log('Server is running...');
})