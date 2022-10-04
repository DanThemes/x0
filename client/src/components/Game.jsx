import React, { useEffect, useState } from 'react'

const checkGame = (game) => {
  if (game[0] === game[1] && game[1] === game[2]) {
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

const Game = ({ user, gameData: {playerOne, playerTwo}, socket }) => {
  const [game, setGame] = useState(new Array(9).fill(null));
  const [nextTurn, setNextTurn] = useState(null);
  const [result, setResult] = useState(null);

  const handleClick = cellNumber => {
    // Exit if not current user's turn
    if(nextTurn !== user.username) return;

    // Make a copy of the game state
    const newGameState = [...game];
    
    // Exit if clicked on a non-empty cell
    if(newGameState[cellNumber] !== null) return;

    let newNextTurn;

    if (playerOne.username === user.username) {
      newGameState[cellNumber] = 'X';
      newNextTurn = playerTwo.username;
    } else {
      newGameState[cellNumber] = '0';
      newNextTurn = playerOne.username;
    }

    const gameUpdate = {
      playerOne,
      playerTwo,
      nextTurn: newNextTurn,
      game: newGameState
    }

    console.log(gameUpdate)

    socket.emit('update_game', gameUpdate);
  }

  useEffect(() => {
    console.log(game);

    // End the game when all cells have been filled in
    if (!game.includes(null)) {
      socket.emit('game_over', {
        playerOne,
        playerTwo,
        game
      });
    }
  }, [game])

  useEffect(() => {
    setNextTurn(() => playerOne.username);

    socket.on('update_game', data => {
      setGame(data.game);
      
      // Check if there's a winner
      if (checkGame(data.game) === 'X') {
        socket.emit('game_over', {
          room: playerOne.id,
          winner: playerOne.username
        });
      } else if (checkGame(data.game) === '0') {
        socket.emit('game_over', {
          room: playerOne.id,
          winner: playerTwo.username
        });
      }


      setNextTurn(data.nextTurn);
      console.log(data);
    })

    socket.on('game_over', data => {
      // setResult()

      if(1) {
        console.log(`Game over! Player ${playerOne.username} won!`);
      }
      
      
      else {
        console.log('Game over! It\'s a draw!');
      }
    })
  }, [])

  return (
    <div className="game">
      <h4>Game</h4>
      {/* {console.log(game)} */}
      <div className="grid">
          {game.map((cell, idx) => {
            return <div key={idx} className={`cell cell-${idx + 1}`} onClick={() => handleClick(idx)}><span>{cell}</span></div>
          })}
        </div>
    </div>
  )
}

export default Game