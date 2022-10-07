import React, { useContext } from 'react';
import ActiveUsers from './components/ActiveUsers';
import Login from './components/Login';
import Challenge from './components/Challenge';
import Chat from './components/Chat';
import Game from './components/Game';
import { GameContext } from './context/StateContext';

import './app.scss';

const App = () => {
  const { state } = useContext(GameContext);

  return (
    <div className="container">
      <aside className="sidebar">
        {!state.user.connected && (
          <>
            <h4>Select a username to chat and play</h4>
            <Login />
          </>
        )}

        {state.user.connected && (
          <>
            <ActiveUsers />
            <Chat />
          </>
        )}
      </aside>

      <main className="content">
        {console.log(state)}
        
        {state.game.showNotification && <Challenge /> }
        <Game />
      </main>

    </div>
  )
}

export default App