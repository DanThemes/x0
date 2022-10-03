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
    socket.auth = { username };
    socket.connect();
    setIsConnected(true);
  }

  const handleClickUser = (opponent) => {
    if (opponent === username) return;
    
    socket.emit('send_challenge', opponent);

    
    
    // socket.emit('join_room', room);
    // setOpponent(room);
  }


  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
    })

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

    socket.on('receive_challenge', challenger => {
      socket.emit('respond_to_challenge', {
        username,
        challenger,
        answer: true // change later to confirm() or something similar
      });
    })

    socket.on('start_game', data => {
      console.log('Playing against')
      console.log(data)
    })

    socket.on('refused_to_play', data => {
      console.log('Player refused to play')
      console.log(data)
    })

    return () => {
      socket.off('connect');
      socket.off('users');
      socket.off('receive_challenge');
      socket.off('start_game');
      socket.off('refused_to_play');
    }
  }, [username])

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
          <p key={user.id} onClick={() => handleClickUser(user.username)}>{user.username}</p>
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