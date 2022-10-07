import React, { useContext } from 'react'
import { ACTIONS } from '../actions/ActionTypes';
import { GameContext } from '../context/StateContext';
import Notification from './Notification';
import socket from '../util/socket';

const Challenge = () => {
  const { state, dispatch } = useContext(GameContext);

  const handleResponseToChallenge = (response) => {
    dispatch({ type: ACTIONS.SET_SHOW_NOTIFICATION, payload: false })

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

  return (
    <Notification message={`You have been challenged to a game by ${state.game.opponent.username}`}>
      <button onClick={() => handleResponseToChallenge(true)}>Accept</button>
      <button onClick={() => handleResponseToChallenge(false)}>Refuse</button>
    </Notification>
  )
}

export default Challenge