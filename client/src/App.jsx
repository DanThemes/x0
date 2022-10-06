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
  const [opponentLeftGame, setOpponentLeftGame] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const { state, dispatch } = useContext(GameContext);

  // Send a challenge
  const handleSendChallenge = (userClicked) => {
    // Can't challenge anyone during a game
    if (state.game.status === GAME_STATUS.ON) return;

    // Exit if user clicks on himself
    if (userClicked.id === socket.id) return;

    // Reset the game (i.e. set state.game back to initial values)
    // dispatch({ type: ACTIONS.RESET_GAME })
    
    // Set the user clicked on as the opponent
    dispatch({ type: ACTIONS.SET_OPPONENT, payload: userClicked })
    
    // Emit a challenge

    // Note: playerOne is always the one sending the challenge
    // and playerTwo is always the one receiving the challenge
    socket.emit('send_challenge', {
      playerOne: { id: socket.id, username: state.user.username },
      playerTwo: { id: userClicked.id, username: userClicked.username }
    });
  }

  const handleResponseToChallenge = (response) => {
    setShowNotification(false);

    if (response === true) {
      socket.emit('join_room', state.game.opponent.id);
      dispatch({ type: ACTIONS.RESTART_GAME })
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
  }, [state.user, dispatch])


  useEffect(() => {
    socket.on('receive_challenge', data => {
      dispatch({ type: ACTIONS.SET_OPPONENT, payload: data.playerOne })
      setShowNotification(true);
      console.log(data);
    })

    socket.on('start_game', data => {
      console.log('game started. . . ')
      setOpponentLeftGame(false);
      setShowNotification(false);
      setShowGame(true);
      

      // Reset the game (i.e. set state.game back to initial values)
      dispatch({ type: ACTIONS.RESTART_GAME })
      dispatch({ type: ACTIONS.SET_NEXT_TURN, payload: data.playerOne.username });
      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.ON })
      dispatch({ type: ACTIONS.SET_PLAYERS, payload: { playerOne: data.playerOne, playerTwo: data.playerTwo } })
    

      

      // setGameData(data);
      console.log('Playing against')
      console.log(data)
    })

    socket.on('refused_to_play', data => {
      setShowNotification(false);
      dispatch({ type: ACTIONS.SET_OPPONENT, payload: null })
      console.log('Player refused to play')
      console.log(data)
    })

    socket.on('game_over', data => {
      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.OFF })
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
        {state.users.map(user => (
          <div key={user.id}>
            <p onClick={() => handleSendChallenge(user)}>{user.username}<br />{user.id}</p>
            <hr />
          </div>
        ))}
      </aside>

      <main className="content">
        {console.log(state)}
        
        {showNotification && <Notification handleResponseToChallenge={handleResponseToChallenge} /> }
        {showGame && <Game opponentLeftGame={opponentLeftGame} setOpponentLeftGame={setOpponentLeftGame} /> }
      </main>

    </div>
  )
}

export default App