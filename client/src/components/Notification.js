import React from 'react'

const Notification = ({ message, children }) => {
  return (
    <div className="notification">
      <p>{message}</p>
      {children}
    </div>
  )
}

export default Notification