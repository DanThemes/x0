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
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  
  const handleUsernameSelect = () => {
    socket.auth = { username };
    socket.connect();
    setIsConnected(true);
  }



  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
    })

    socket.on('users', users => {
      console.log(users);

      console.log(username);
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
      socket.off('connect');
      socket.off('users');
    }
  }, [])

  return (
    <div className="container">
      {console.log(username, users)}

      <aside className="sidebar">
        {!isConnected && (
          <>
            <h4>Select a username to chat and play</h4>
            <Login username={username} setUsername={setUsername} handleUsernameSelect={handleUsernameSelect} />
          </>
        )}

        <h4>Global Chat</h4>

        <p>chat...</p>
        {users.map(user => (
          <p key={user.id}>{user.username}</p>
        ))}
      </aside>

      <main className="content">
        {/* {!username ? ( */}
          {/* <Login username={username} setUsername={setUsername} /> */}
          {/* ) : ( */}
          <Game username={username} />
        {/* )} */}
      </main>

    </div>
  )
}

export default App