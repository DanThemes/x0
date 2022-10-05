import React, { useContext } from 'react'
import { GameContext } from '../context/StateContext'

const Notification = ({handleResponseToChallenge}) => {
  const { state } = useContext(GameContext);

  return (
    <div className="notification">
      <p>You have been challenged to a game by {state.game.opponent.username}</p>
      <button onClick={() => handleResponseToChallenge(true)}>Accept</button>
      <button onClick={() => handleResponseToChallenge(false)}>Refuse</button>
    </div>
  )
}

export default Notification