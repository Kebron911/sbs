import { GameState, GameAction } from '../types';

export const appReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'APPLY_API_UPDATE':
      // This is the core of the new architecture. It takes a partial state update
      // from the simulated API and merges it into the current state.
      return { ...state, ...action.payload };

    case 'COMPLETE_ONBOARDING_UI':
      // Some actions might still need to directly manipulate state before an API can be called
      // (like the initial onboarding). This is now an explicit UI action.
      return { ...state, isOnboarded: true, character: action.payload.character };

    default:
      return state;
  }
};
