export const GAME_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  ENDED: 'ENDED'
});

export const INITIAL_STATE = {
  user: {},
  users: [],
  game: {
    status: GAME_STATUS.NOT_STARTED,
    nextTurn: '',
    winner: null,
    result: null
  }
}

export const GameReducer = (state, action) => {
  const { type, payload } = action;
  switch(type) {
    case 'Test':
      return state;








    default:
      return state;
  }
}