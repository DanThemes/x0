import React, { useRef } from 'react'

const Login = ({username, setUsername, handleUsernameSelect}) => {
  return (
    <div className="login">
      <input type="text" placeholder="Username..." value={username} onChange={e => setUsername(e.target.value)} />
      <button onClick={handleUsernameSelect}>Select</button>
    </div>
  )
}

export default Login