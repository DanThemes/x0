export const INITIAL_STATE = {
  test: 1
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