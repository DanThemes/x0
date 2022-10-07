const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const giveMeAJoke = require('give-me-a-joke');

app.use(cors());

// Add headers before the routes are defined
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://danthemes.com');

  // Pass to next layer of middleware
  next();
});

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'https://danthemes.com',
    credentials: true,
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
    const playerTwoSocket = io.sockets.sockets.get(data.playerTwo.id);
    playerTwoSocket?.join(data.playerTwo.id);
    
    const playerOneSocket = io.sockets.sockets.get(data.playerOne.id);
    playerOneSocket.leave(data.playerTwo.id);

    console.log(`${data.playerOne.id} send a challenge to ${data.playerTwo.id}`);
    console.log(io.sockets.adapter.rooms.get(data.playerOne.id))

    io.to(data.playerTwo.id).emit('receive_challenge', data)
  })

  socket.on('join_room', room => {
    socket.join(room);

    console.log(`${socket.username} has joined room: ${room}`)
  })

  
  console.log('---')
  console.log(socket.id)
  console.log(socket.rooms)
  console.log('---')

  socket.on('respond_to_challenge', data => {
    // console.log(data);
    console.log(`${socket.id} respond_to_challenge`)
    
    // if playerTwo accepted, start the game
    const playerOneSocket = io.sockets.sockets.get(data.playerOne.id);
    playerOneSocket.join(data.playerOne.id);

    console.log(data.playerOne.id);
    console.log(io.sockets.adapter.rooms.get(data.playerOne.id))
    if (data.answer) {
      io.to(data.playerOne.id).emit('start_game', data);
    } 
    
    // if playerTwo refused, emit a refused_to_play event
    else {
      io.to(data.playerOne.id).emit('refused_to_play', data);
    }
  })
  
  socket.on('leave_game', data => {
    // remove socket from room, but only if it's not his own room

    // Bug might be here... users should not be allowed to leave their own rooms
    const userWhoLeftSocket = io.sockets.sockets.get(data.userWhoLeft.id);
    userWhoLeftSocket.leave(data.room);

    // emit user_left_game to the other player
    io.to(data.room).emit('user_left_game', data.userWhoLeft);
    console.log(`data.room: ${data.room} - socket id: ${socket.id}`)
    // console.log(socket.rooms)
    console.log(io.sockets.adapter.rooms.get(data.room))
  })

  socket.on('restart_game', data => {
    io.to(data.playerOne.id).emit('restart_game', data);
  })

  socket.on('update_game', data => {
    io.to(data.playerOne.id).emit('update_game', data);
  });

  socket.on('game_over', data => {
    io.to(data.room).emit('game_over', data.winner);
  })


  socket.on('disconnect', () => {
    // TODO: stop the game on disconnect and send a notification
    console.log(`${socket.id} disconnected`)
  })




  // Chat
  socket.on('send_message', data => {
    console.log('send_message');
    console.log(data);
    io.emit('receive_message', data);
  })



 
});





app.get('/', (req, res) => {
  giveMeAJoke.getRandomDadJoke (function(joke) {
    res.send(joke);
  });
  // res.send('Nothing to see here.');
})

server.listen(3001, () => {
  console.log('Server is running...');
})