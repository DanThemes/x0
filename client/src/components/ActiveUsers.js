import React, { useContext, useEffect } from 'react'
import { ACTIONS } from '../actions/ActionTypes';
import { GameContext } from '../context/StateContext'
import { GAME_STATUS } from '../reducers/GameReducer';
import socket from '../util/socket';

const ActiveUsers = () => {
  const { state, dispatch } = useContext(GameContext);

  // Send a challenge
  const handleSendChallenge = (userClicked) => {
    // Can't challenge anyone during a game

    // TODO: remove or disable the "Play against" button if the user is
    // currently in a game
    if (state.game.status === GAME_STATUS.ON) return;

    // Exit if user clicks on himself
    if (userClicked.id === socket.id) return;
    
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

  useEffect(() => {
    socket.on('users', usersList => {
      console.log(usersList)

      // Or show the current user and underneath show all the rest
      // of the users by using .filter on the users array
      // to filter out the current user
      const newUsers = usersList.sort((a, b) => {
        if (a.id === socket.id) return -1;
        if (b.id === socket.id) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      })

      dispatch({ type: ACTIONS.SET_USER_ID, payload: { id: socket.id } })
      dispatch({ type: ACTIONS.SET_USERS, payload: { users: newUsers } })
    })

    return () => {
      socket.off('users');
    }
  }, [socket, dispatch])

  return (
    <div className='active-users'>
      <h4>Active users</h4>
      {console.log(state)}
      {state.users.map(user => (
          <div key={user.id} className='active-user'>
            <span>{user.username}</span>
            {user.id !== state.user.id && <button onClick={() => handleSendChallenge(user)}>Play against</button>
            }
          </div>
        ))}
    </div>
  )
}

export default ActiveUsers