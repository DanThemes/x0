import React, { useEffect, useState } from 'react'
import { useContext } from 'react';
import { ACTIONS } from '../actions/ActionTypes';
import { GameContext } from '../context/StateContext';
import { GAME_STATUS, RESULT_STATUS } from '../reducers/GameReducer';
import socket from '../util/socket';

const checkGame = (game) => {
  if (game[0] === game[1] && game[1] === game[2]) {
    // TODO: make a line animation through the winning combo
    return game[0];
  } else if (game[3] === game[4] && game[4] === game[5]) {
    return game[3];
  } else if (game[6] === game[7] && game[7] === game[8]) {
    return game[6];
  } else if (game[0] === game[3] && game[3] === game[6]) {
    return game[0];
  } else if (game[1] === game[4] && game[4] === game[7]) {
    return game[1];
  } else if (game[2] === game[5] && game[5] === game[8]) {
    return game[2];
  } else if (game[0] === game[4] && game[4] === game[8]) {
    return game[0];
  } else if (game[2] === game[4] && game[4] === game[6]) {
    return game[2];
  }
  return null;
}

const Game = ({opponentLeftGame, setOpponentLeftGame}) => {

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
    console.log(state.game.grid);

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
  }, [state.game.grid])

  useEffect(() => {
    dispatch({ type: ACTIONS.SET_NEXT_TURN, payload: state.game.playerOne?.username });

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

      console.log(data);
    })

    socket.on('game_over', winner => {
      if(winner !== null) {
        console.log(`Game over! Player ${winner} won!`);
      } else {
        console.log('Game over! It\'s a draw!');
      }

      dispatch({ type: ACTIONS.SET_WINNER, payload: winner })
    })

    
    socket.on('user_left_game', userWhoLeft => {
      console.log('user_left_game listener');
      setOpponentLeftGame(true);

      dispatch({ type: ACTIONS.RESET_GAME })
      // dispatch({ type: ACTIONS.USER_LEFT_GAME, payload: userWhoLeft.username });
    })

    socket.on('restart_game', data => {
      console.log('restart_game listener - client side')
      dispatch({ type: ACTIONS.RESTART_GAME })
      dispatch({ type: ACTIONS.SET_NEXT_TURN, payload: data.playerOne.username });
    })
  }, [])

  return (
    <div className="game">

      <h4>Game</h4>

      {state.game.winner && (
          <p>The winner is <strong>{state.game.winner}</strong>.</p>
      )}

      {
        (state.game.result !== null && state.game.result !== RESULT_STATUS.WITHDREW) &&
        (
          <button onClick={handleRestartGame}>Restart game</button>
        )
      }

      {
        opponentLeftGame &&
        (<p>Opponent has left the game.</p>)
      }

      {/* {console.log(game)} */}

      {
        (state.game.status === GAME_STATUS.ON || state.game.result === RESULT_STATUS.WIN) ? 
        (
          <>
            <button onClick={handleLeaveGame}>Leave game</button>
            <div className={`grid ${state.game.status.toLowerCase()}`}>
              {state.game.grid.map((cell, idx) => {
                return <div key={idx} className={`cell cell-${idx + 1}`} onClick={() => handleClick(idx)}><span>{cell}</span></div>
              })}
            </div>
          </>
        ) : (
          <p>Click on a user to send a new game challenge.</p>
        )
      }

    </div>
  )
}

export default Game