import React, { useState, useEffect, useContext } from 'react';
import Game from './components/Game';
import Login from './components/Login';
import Notification from './components/Notification';
import { GameContext } from './context/StateContext';
import { GAME_STATUS } from './reducers/GameReducer';
import { ACTIONS } from "./actions/ActionTypes";
import socket from './util/socket';

import './app.css';


const App = () => {
  const [user, setUser] = useState({});
  const [opponent, setOpponent] = useState({});
  const [users, setUsers] = useState([]);
  // const [isConnected, setIsConnected] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showGame, setShowGame] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false);
  const [gameData, setGameData] = useState({});

  const { state, dispatch } = useContext(GameContext);

  // state.socket.connect()

  // const handleUserSelect = () => {
  //   // if (state.user.username.length < 1) return;

  //   // // TODO: don't allow 2 users with the same username

  //   // socket.auth = { username: state.user.username };
  //   // socket.connect();
    
  //   // dispatch({ type: ACTIONS.SET_IS_CONNECTED, payload: true})
  //   // setIsConnected(true);
  // }

  // Send a challenge
  const handleSendChallenge = (userClicked) => {
    // Can't challenge anyone during a game
    if (state.game.status === GAME_STATUS.STARTED) return;

    // setOpponent(userClicked);
    dispatch({ type: ACTIONS.SET_OPPONENT, payload: userClicked })

    // Exit if user clicks on himself
    if (userClicked.id === socket.id) return;
    
    // Emit a challenge

    // Note: playerOne is always the one sending the challenge
    // and playerTwo is always the one receiving the challenge
    socket.emit('send_challenge', {
      playerOne: { id: socket.id, username: state.user.username },
      playerTwo: { id: userClicked.id, username: userClicked.username }
    });
  }

  const handleResponseToChallenge = response => {
    setShowNotification(false);

    if (response) {
      socket.emit('join_room', state.game.opponent.id);
    }

    socket.emit('respond_to_challenge', {
      playerOne: state.game.opponent,
      playerTwo: state.user,
      answer: response
    });
  }

  useEffect(() => {
    socket.on('users', usersList => {
      console.log(usersList)

      // Or show the current user and underneath show all the rest
      // of the users by using .filter on the users array.
      const newUsers = usersList.sort((a, b) => {
        // console.log(`${a.username} = ${username} AND ${b.username} = ${username}`);
        if (a.username === state.user.username) return -1;
        if (b.username === state.user.username) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      })

      // setUser((prev) => ({ ...prev, id: socket.id }));
      dispatch({ type: ACTIONS.SET_USER_ID, payload: { id: socket.id } })
      dispatch({ type: ACTIONS.SET_USERS, payload: { users: newUsers } })
    })

    return () => {
      socket.off('users');
    }
  }, [state.user])


  useEffect(() => {
    socket.on('receive_challenge', data => {
      // setOpponent(data.playerOne);
      dispatch({ type: ACTIONS.SET_OPPONENT, payload: data.playerOne })
      setShowNotification(true);
      console.log(data);
    })

    socket.on('start_game', data => {
      setShowNotification(false);
      setShowGame(true);
      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.STARTED })
      dispatch({ type: ACTIONS.SET_PLAYERS, payload: { playerOne: data.playerOne, playerTwo: data.playerTwo } })
    

      

      // setGameData(data);
      console.log('Playing against')
      console.log(data)
    })

    socket.on('refused_to_play', data => {
      setShowNotification(false);
      dispatch({ type: ACTIONS.SET_OPPONENT, payload: {} })
      console.log('Player refused to play')
      console.log(data)
    })

    socket.on('game_over', data => {
      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.ENDED })
      // setIsPlaying(false);
    })

    return () => {
      socket.off('receive_challenge');
      socket.off('start_game');
      socket.off('refused_to_play');
      socket.off('game_over');
    }
  }, [dispatch])

  return (
    <div className="container">
      <aside className="sidebar">
        {!state.user.connected && (
          <>
            <h4>Select a username to chat and play</h4>
            {/* <Login user={user} setUser={setUser} handleUserSelect={handleUserSelect} /> */}
            <Login />
          </>
        )}

        <h4>Global Chat</h4>

        <p>chat...</p>
        {console.log(state.user)}
        {state.users.map(user => (
          <div key={user.id}>
            <p onClick={() => handleSendChallenge(user)}>{user.username}<br />{user.id}</p>
            <hr />
          </div>
        ))}
      </aside>

      <main className="content">
        {console.log(state)}
        
        {/* {!username ? ( */}
          {/* <Login username={username} setUsername={setUsername} /> */}
          {/* ) : ( */}
          {showNotification && <Notification handleResponseToChallenge={handleResponseToChallenge} /> }
          {showGame && <Game /> }
        {/* )} */}
      </main>

    </div>
  )
}

export default App