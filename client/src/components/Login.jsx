import React from 'react'

const Login = ({user, setUser, handleUserSelect}) => {
  return (
    <div className="login">
      <input type="text" placeholder="Username..." value={user.username || ''} onChange={e => setUser({ username: e.target.value })} />
      <button onClick={handleUserSelect}>Select</button>
    </div>
  )
}

export default Login