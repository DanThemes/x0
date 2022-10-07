import React, { useContext } from 'react';
import { GameContext } from '../context/StateContext';
import { ACTIONS } from '../actions/ActionTypes';
import { useRef } from 'react';

import socket from '../util/socket';

const Login = () => {
  const { state, dispatch } = useContext(GameContext);

  const usernameRef = useRef();

  const handleUserSelect = () => {
    // Min 1 character
    if (usernameRef.current.value.length < 1) return;
    
    // Don't allow 2 users with the same username
    // if (state.users.find(user => user.username === usernameRef.current.value)) return;

    // Set the username
    dispatch({ type: ACTIONS.SET_USER_USERNAME, payload: usernameRef.current.value })

    // Connect the socket to the server
    socket.auth = { username: usernameRef.current.value };
    socket.connect();

    // Set the user as connected
    dispatch({ type: ACTIONS.SET_IS_CONNECTED, payload: true })
  }

  return (
    <div className="login">
      {/* {console.log(state.socket)} */}
      <input type="text" placeholder="Username..." ref={usernameRef} />
      <button onClick={handleUserSelect}>Select</button>
    </div>
  )
}

export default Login