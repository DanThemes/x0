import React, { useState } from 'react';
import Game from './components/Game';
import Login from './components/Login';
import io from 'socket.io-client';

import './app.css';
import { useEffect } from 'react';

const socket = io('http://localhost:3001', {
  autoConnect: false,

  withCredentials: true,
  transports: ['websocket']
});

const App = () => {
  const [username, setUsername] = useState('');
  const [opponent, setOpponent] = useState('');
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  
  const handleUsernameSelect = () => {
    if (username.length < 1) return;

    socket.auth = { username };
    socket.connect();
    setIsConnected(true);
  }

  const handleSendChallenge = (userIdClicked) => {
    setOpponent(userIdClicked);

    // Exit if use clicks on himself
    if (userIdClicked === socket.id) return;
    
    // Emit a challenge
    socket.emit('send_challenge', {
      playerOne: socket.id,
      playerTwo: userIdClicked
    });

    
  }

  useEffect(() => {
    socket.on('users', users => {
      console.log('on users event')
      const newUsers = users.sort((a, b) => {
        // console.log(`${a.username} = ${username} AND ${b.username} = ${username}`);
        if (a.username === username) return -1;
        if (b.username === username) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      })

      setUsers(newUsers);
    })

    return () => {
      socket.off('users');
    }
  }, [username])


  useEffect(() => {
    // socket.on('connect', () => {
    //   console.log('connected');
    // })

    socket.on('receive_challenge', data => {
      // socket.emit('respond_to_challenge', {
      //   username,
      //   challenger,
      //   answer: true // change later to confirm() or something similar
      // });

      // TODO: create a helper function that shows a
      // popup with the challenge, and 2 buttons
      // to accept or deny, each having an onClick function attached
      console.log(data);
    })

    socket.on('start_game', data => {
      console.log('Playing against')
      console.log(data)

      // join opponent room only after he accepts to play
      socket.emit('join_room', data.opponent);
    })

    socket.on('refused_to_play', data => {
      console.log('Player refused to play')
      console.log(data)
    })

    return () => {
      socket.off('connect');
      socket.off('receive_challenge');
      socket.off('start_game');
      socket.off('refused_to_play');
    }
  }, [])

  return (
    <div className="container">
      <aside className="sidebar">
        {!isConnected && (
          <>
            <h4>Select a username to chat and play</h4>
            <Login username={username} setUsername={setUsername} handleUsernameSelect={handleUsernameSelect} />
          </>
        )}

        <h4>Global Chat</h4>

        <p>chat...</p>
        {console.log(users)}
        {users.map(user => (
          <p key={user.id} onClick={() => handleSendChallenge(user.id)}>{user.username}</p>
        ))}
      </aside>

      <main className="content">
        {/* {!username ? ( */}
          {/* <Login username={username} setUsername={setUsername} /> */}
          {/* ) : ( */}
          <Game username={username} opponent={opponent} />
        {/* )} */}
      </main>

    </div>
  )
}

export default App