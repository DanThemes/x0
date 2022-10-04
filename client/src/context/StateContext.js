import React, { createContext, useReducer } from 'react'
import { INITIAL_STATE, GameReducer } from '../reducers/GameReducer';

export const GameContext = createContext(null);

export const GameContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(GameReducer, INITIAL_STATE);

  return (
    <GameContext.Provider value={{state, dispatch}}>
      {children}
    </GameContext.Provider>
  )
}