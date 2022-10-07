import React, { useEffect } from 'react'
import { useContext } from 'react';
import { ACTIONS } from '../actions/ActionTypes';
import { GameContext } from '../context/StateContext';
import { GAME_STATUS, RESULT_STATUS } from '../reducers/GameReducer';
import Notification from './Notification';
import socket from '../util/socket';
import checkGame from '../util/checkGame';

const Game = () => {
  const { state, dispatch } = useContext(GameContext);

  const handleClick = cellNumber => {
    // Exit if we have a winner or if the game ended (i.e. someone disconnected/left the game)
    if (state.game.winner || state.game.status === GAME_STATUS.OFF) return;

    // Exit if not current user's turn
    if (state.game.nextTurn !== state.user.username) return;

    // Make a copy of the game state
    const newGameState = [...state.game.grid];
    
    // Exit if clicked on a non-empty cell
    if (newGameState[cellNumber] !== null) return;

    let newNextTurn;

    if (state.game.playerOne.username === state.user.username) {
      newGameState[cellNumber] = 'X';
      newNextTurn = state.game.playerTwo.username;
    } else {
      newGameState[cellNumber] = '0';
      newNextTurn = state.game.playerOne.username;
    }

    const gameUpdate = {
      playerOne: state.game.playerOne,
      playerTwo: state.game.playerTwo,
      nextTurn: newNextTurn,
      grid: newGameState
    }

    console.log(gameUpdate)

    socket.emit('update_game', gameUpdate);
    dispatch({ type: ACTIONS.UPDATE_GAME_GRID, payload: gameUpdate.grid })
  }

  const handleLeaveGame = () => {
    socket.emit('leave_game', {
      room: state.game.playerOne.id,
      userWhoLeft: state.user
    });
    dispatch({ type: ACTIONS.RESET_GAME })
  }

  const handleRestartGame = () => {
    socket.emit('restart_game', {
      playerOne: state.game.playerOne,
      playerTwo: state.game.playerTwo
    });
  }

  useEffect(() => {
    // End the game when all cells have been filled in
    if (!state.game.grid.includes(null)) {

      // Draw
      if (checkGame(state.game.grid) === null) {
        socket.emit('game_over', {
          room: state.game.playerOne.id,
          winner: null
        });
      }
    }
  }, [state.game.grid, state.game.playerOne])

  useEffect(() => {
    dispatch({ type: ACTIONS.SET_NEXT_TURN, payload: state.game.playerOne?.username });

    socket.on('receive_challenge', data => {
      console.log('received_challenge')
      dispatch({ type: ACTIONS.SET_OPPONENT, payload: data.playerOne });
      dispatch({ type: ACTIONS.SET_SHOW_NOTIFICATION, payload: true });
      // console.log(data);
    })

    socket.on('refused_to_play', data => {
      dispatch({ type: ACTIONS.SET_SHOW_NOTIFICATION, payload: false });
      dispatch({ type: ACTIONS.SET_OPPONENT, payload: null });
      // console.log('Player refused to play');
      // console.log(data);
    })

    socket.on('start_game', data => {
      dispatch({ type: ACTIONS.SET_OPPONENT_LEFT_GAME, payload: false });
      dispatch({ type: ACTIONS.SET_SHOW_NOTIFICATION, payload: false });
      dispatch({ type: ACTIONS.SET_SHOW_GAME, payload: true });

      dispatch({ type: ACTIONS.RESTART_GAME })
      dispatch({ type: ACTIONS.SET_NEXT_TURN, payload: data.playerOne.username });
      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.ON });
      dispatch({ type: ACTIONS.SET_PLAYERS, payload: { playerOne: data.playerOne, playerTwo: data.playerTwo } });

      console.log('Playing against')
      console.log(data)
    })

    socket.on('update_game', data => {
      // Check if there's a winner
      if (checkGame(data.grid) === 'X') {
        socket.emit('game_over', {
          room: state.game.playerOne.id,
          winner: state.game.playerOne.username
        });
      } else if (checkGame(data.grid) === '0') {
        socket.emit('game_over', {
          room: state.game.playerOne.id,
          winner: state.game.playerTwo.username
        });
      }

      dispatch({ type: ACTIONS.UPDATE_GAME_GRID, payload: data.grid })
      dispatch({ type: ACTIONS.SET_NEXT_TURN, payload: data.nextTurn });

      // console.log(data);
    })

    socket.on('user_left_game', userWhoLeft => {
      console.log('user_left_game listener');
      dispatch({ type: ACTIONS.SET_OPPONENT_LEFT_GAME, payload: true });

      dispatch({ type: ACTIONS.RESET_GAME })
      // dispatch({ type: ACTIONS.USER_LEFT_GAME, payload: userWhoLeft.username });
    })

    socket.on('restart_game', data => {
      console.log('restart_game listener - client side')
      dispatch({ type: ACTIONS.RESTART_GAME })
      dispatch({ type: ACTIONS.SET_NEXT_TURN, payload: data.playerOne.username });
    })

    socket.on('game_over', winner => {
      if(winner !== null) {
        dispatch({ type: ACTIONS.SET_WINNER, payload: winner })
      } else {
        dispatch({ type: ACTIONS.SET_DRAW })
      }

      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.OFF });
    })

    return () => {
      socket.off('receive_challenge');
      socket.off('refused_to_play');
      socket.off('start_game');
      socket.off('update_game');
      socket.off('user_left_game');
      socket.off('restart_game');
      socket.off('game_over');
    }
  }, [dispatch, state.game.playerOne, state.game.playerTwo])

  return (
    <div className="game">

      <h4>Game</h4>

      {/* TODO: keep track of the score between 2 players */}



      {
        state.game.result === RESULT_STATUS.WIN && 
        <Notification message={`The winner is ${state.game.winner}.`}>
          <button onClick={handleRestartGame}>Restart game</button>
        </Notification>
      }

      {
        state.game.result === RESULT_STATUS.DRAW && 
        <Notification message={`It's a draw.`}>
          <button onClick={handleRestartGame}>Restart game</button>
        </Notification>
      }

      {
        state.game.opponentLeftGame && 
        <Notification message='Opponent has left the game.'>
          <button onClick={handleRestartGame}>Restart game</button>
        </Notification>
      }

      {
        (state.game.status === GAME_STATUS.ON || state.game.result === RESULT_STATUS.WIN) ? 
        (
          <>
            <div className={`grid ${state.game.status.toLowerCase()}`}>
              {state.game.grid.map((cell, idx) => {
                return <div key={idx} className={`cell cell-${idx + 1}`} onClick={() => handleClick(idx)}><span>{cell}</span></div>
              })}
            </div>
            
            <button onClick={handleLeaveGame} className="button-leave">Leave game</button>
          </>
        ) : (
          <p>Click the "Play against" button to challenge a user to a game.</p>
        )
      }

    </div>
  )
}

export default Game