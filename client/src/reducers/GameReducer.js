import { ACTIONS } from "../actions/ActionTypes";

export const RESULT_STATUS = Object.freeze({
  WIN: 'WIN',
  DRAW: 'DRAW',
  WITHDREW: 'WITHDREW'
});

export const GAME_STATUS = Object.freeze({
  ON: 'ON',
  OFF: 'OFF'
});


export const INITIAL_STATE = {
  user: {},
  users: [],
  game: {
    playerOne: null,
    playerTwo: null,
    grid: new Array(9).fill(null),
    status: GAME_STATUS.OFF,
    opponent: null,
    nextTurn: null,
    winner: null,
    result: null,
    opponentLeftGame: false,
    showNotification: false,
    showGame: false
  },
  // notification: null
}

export const GameReducer = (state, action) => {
  const { type, payload } = action;
  switch(type) {

    case ACTIONS.SET_OPPONENT:
      return {
        ...state,
        game: {
          ...state.game, opponent: payload
        }
      };
      
    case ACTIONS.SET_IS_CONNECTED:
      return {
        ...state,
        user: {
          ...state.user, connected: payload
        }
      }
    
    case ACTIONS.SET_USER_USERNAME:
      return {
        ...state,
        user: {
          ...state.user, username: payload
        }
      }
  
    case ACTIONS.SET_USER_ID:
      return {
        ...state,
        user: {
          ...state.user, id: payload.id
        }
      }
  
    case ACTIONS.SET_USERS:
      return {
        ...state,
        users: payload.users
      }

    case ACTIONS.SET_PLAYERS:
      return {
        ...state,
        game: {
          ...state.game,
          playerOne: payload.playerOne,
          playerTwo: payload.playerTwo
        }
      }

    case ACTIONS.UPDATE_GAME_GRID:
      return {
        ...state,
        game: {
          ...state.game,
          grid: payload
        }
      }

    case ACTIONS.SET_NEXT_TURN:
      return {
        ...state,
        game: {
          ...state.game,
          nextTurn: payload
        }
      }

    case ACTIONS.SET_WINNER:
      return {
        ...state,
        game: {
          ...state.game,
          status: GAME_STATUS.OFF,
          nextTurn: null,
          winner: payload,
          result: RESULT_STATUS.WIN
        }
      }

    case ACTIONS.SET_DRAW:
      return {
        ...state,
        game: {
          ...state.game,
          status: GAME_STATUS.OFF,
          nextTurn: null,
          winner: null,
          result: RESULT_STATUS.DRAW
        }
      }

    case ACTIONS.RESTART_GAME:
      return {
        ...state,
        game: {
          ...state.game,
          grid: new Array(9).fill(null),
          status: GAME_STATUS.ON,
          nextTurn: null,
          winner: null,
          result: null
        }
      }

    // case ACTIONS.USER_LEFT_GAME:
    //   return {
    //     ...state,
    //     game: {
    //       ...state.game,
    //       status: GAME_STATUS.OFF,
    //       result: RESULT_STATUS.WITHDREW
    //     }
    //   }

    case ACTIONS.SET_GAME_STATUS:
      return {
        ...state,
        game: {
          ...state.game,
          status: payload
        }
      }
  
    case ACTIONS.RESET_GAME:
      return {
        ...state,
        game: {
          ...INITIAL_STATE.game
        }
      }

    case ACTIONS.SET_SHOW_NOTIFICATION:
      return {
        ...state,
        game: {
          ...state.game,
          showNotification: payload
        }
      }

    case ACTIONS.SET_OPPONENT_LEFT_GAME:
      return {
        ...state,
        game: {
          ...state.game,
          opponentLeftGame: payload
        }
      }

    case ACTIONS.SET_SHOW_GAME:
      return {
        ...state,
        game: {
          ...state.game,
          showGame: payload
        }
      }













    // case ACTIONS.SET_SOCKET_AUTH:
    //   return {
    //     ...state,
    //     socket: {
    //       ...socket, auth: payload
    //     }
    //   }

    // case ACTIONS.SET_CONNECTED_SOCKET:
    //   return {
    //     ...state,
    //     socket: payload
    //   }





    default:
      return state;
  }
}