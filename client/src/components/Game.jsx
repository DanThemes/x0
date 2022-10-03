import React, { useEffect, useState } from 'react'

const Game = ({username, opponent}) => {
  const [game, setGame] = useState(new Array(9).fill(null));
  const [playerOne, setPlayerOne] = useState({username:'A'});
  const [playerTwo, setPlayerTwo] = useState({username:'B'});
  const [nextTurn, setNextTurn] = useState(null);

  const handleClick = cellNumber => {
    if(nextTurn !== username) return;

    const newGameState = [...game];

    if (playerOne.username === username) {
      newGameState[cellNumber] = 'x';
      setNextTurn(playerTwo.username);
    } else {
      newGameState[cellNumber] = '0';
      setNextTurn(playerOne.username);
    }

    setGame(newGameState);
  }

  useEffect(() => {
    setNextTurn(() => playerOne.username);
  }, [playerOne.username])

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