import React, { useState, useEffect, useContext } from 'react';
import Game from './components/Game';
import Login from './components/Login';
import Notification from './components/Notification';
import { GameContext } from './context/StateContext';
import io from 'socket.io-client';

import './app.css';

const socket = io('http://localhost:3001', {
  autoConnect: false,

  withCredentials: true,
  transports: ['websocket']
});

const App = () => {
  const [user, setUser] = useState({});
  const [opponent, setOpponent] = useState({});
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameData, setGameData] = useState({});

  const {state, dispatch} = useContext(GameContext);


  
  const handleUserSelect = () => {
    if (user.username.length < 1) return;

    // TODO: don't allow 2 users with the same username

    socket.auth = { username: user.username };
    socket.connect();
    
    setIsConnected(true);
  }

  // Send a challenge
  const handleSendChallenge = (userClicked) => {
    // Can't challenge anyone during a game
    if (isPlaying) return;

    setOpponent(userClicked);

    // Exit if user clicks on himself
    if (userClicked.id === socket.id) return;
    
    // Emit a challenge
    socket.emit('send_challenge', {
      playerOne: { id: socket.id, username: user.username },
      playerTwo: { id: userClicked.id, username: userClicked.username }
    });
  }

  const handleResponseToChallenge = response => {
    setShowNotification(false);

    if (response) {
      socket.emit('join_room', opponent.id);
    }

    socket.emit('respond_to_challenge', {
      playerOne: opponent,
      playerTwo: user,
      answer: response
    });
  }

  useEffect(() => {
    socket.on('users', usersList => {
      console.log('on users event')
      console.log(usersList)

      const newUsers = usersList.sort((a, b) => {
        // console.log(`${a.username} = ${username} AND ${b.username} = ${username}`);
        if (a.username === user.username) return -1;
        if (b.username === user.username) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      })

      
      setUser((prev) => ({ ...prev, id: socket.id }));
      setUsers(newUsers);
    })

    return () => {
      socket.off('users');
    }
  }, [user])


  useEffect(() => {
    socket.on('receive_challenge', data => {
      setOpponent(data.playerOne);
      setShowNotification(true);
      console.log(data);
    })

    socket.on('start_game', data => {
      setShowNotification(false);
      setShowGame(true);
      setIsPlaying(true);
      setGameData(data);
      console.log('Playing against')
      console.log(data)
    })

    socket.on('refused_to_play', data => {
      setShowNotification(false);
      setOpponent({});
      console.log('Player refused to play')
      console.log(data)
    })

    socket.on('game_over', data => {
      setIsPlaying(false);
    })

    return () => {
      socket.off('receive_challenge');
      socket.off('start_game');
      socket.off('refused_to_play');
      socket.off('game_over');
    }
  }, [])

  return (
    <div className="container">
      <aside className="sidebar">
        {!isConnected && (
          <>
            <h4>Select a username to chat and play</h4>
            <Login user={user} setUser={setUser} handleUserSelect={handleUserSelect} />
          </>
        )}

        <h4>Global Chat</h4>

        <p>chat...</p>
        {console.log(user)}
        {users.map(user => (
          <div key={user.id}>
            <p onClick={() => handleSendChallenge(user)}>{user.username}<br />{user.id}</p>
            <hr />
          </div>
        ))}
      </aside>

      <main className="content">
        {/* {console.log(state)} */}
        
        {/* {!username ? ( */}
          {/* <Login username={username} setUsername={setUsername} /> */}
          {/* ) : ( */}
          {showNotification && <Notification handleResponseToChallenge={handleResponseToChallenge} opponent={opponent} /> }
          {showGame && <Game user={user} gameData={gameData} socket={socket} /> }
        {/* )} */}
      </main>

    </div>
  )
}

export default App