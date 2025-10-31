import { GameState, GameAction } from '../types';
import { appReducer } from './appReducer';
import { uiReducer } from './uiReducer';

export const rootReducer = (state: GameState, action: GameAction): GameState => {
  // Sequentially apply reducers. appReducer handles core state updates from the API.
  // uiReducer handles UI-specific state changes like loading flags and modals.
  // This ensures that UI state can react to both direct UI actions and the results of API calls.
  let nextState = appReducer(state, action);
  nextState = uiReducer(nextState, action);
  
  return nextState;
};
