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

export default checkGame;