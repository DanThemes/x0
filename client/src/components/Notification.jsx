import React from 'react'

const Notification = ({handleResponseToChallenge, opponent}) => {
  return (
    <div className="notification">
      <p>You have been challenged to a game by {opponent.username}</p>
      <button onClick={() => handleResponseToChallenge(true)}>Accept</button>
      <button onClick={() => handleResponseToChallenge(false)}>Refuse</button>
    </div>
  )
}

export default Notification