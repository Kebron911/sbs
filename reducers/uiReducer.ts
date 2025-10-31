import { Reward, Badge, Toast, GameAction, GameState, QuestTemplate, AIMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

// This new UIState type extract only the parts of GameState this reducer is responsible for.
// This helps enforce separation of concerns.
type UIState = Pick<
  GameState,
  | 'loadingStates'
  | 'rewardModalData'
  | 'battleAnimationData'
  | 'badgeNotification'
  | 'dailyBriefing'
  | 'toasts'
  | 'reviewCalendarDate'
  | 'templateForQuest'
  | 'activeBossFight'
  | 'bossFightVictoryData'
  | 'tutorialStep'
  | 'isAiChatOpen'
  | 'aiConversation'
>;

export const uiReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'APPLY_API_UPDATE': {
        // This is the core of the new architecture. When the API service returns
        // an update, this reducer checks for specific state changes that should trigger UI effects.
        const { payload } = action;
        let newState = { ...state };

        if (payload.rewardModalData) newState.rewardModalData = payload.rewardModalData;
        if (payload.battleAnimationData) newState.battleAnimationData = payload.battleAnimationData;
        if (payload.badgeNotification) newState.badgeNotification = payload.badgeNotification;
        if (payload.toasts) newState.toasts = payload.toasts;
        if (payload.bossFightVictoryData) newState.bossFightVictoryData = payload.bossFightVictoryData;
        if (payload.activeBossFight !== undefined) newState.activeBossFight = payload.activeBossFight;

        return newState;
    }

    // --- UI-ONLY ACTIONS ---
    case 'HIDE_REWARD_MODAL':
      return { ...state, rewardModalData: null };
    case 'HIDE_BATTLE_ANIMATION':
      return { ...state, battleAnimationData: null };
    case 'HIDE_BADGE_NOTIFICATION':
      return { ...state, badgeNotification: null };
    case 'HIDE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload.id) };
    case 'SET_REVIEW_DATE':
      return { ...state, reviewCalendarDate: action.payload.date };
    case 'START_QUEST_FROM_TEMPLATE':
      return { ...state, templateForQuest: action.payload.template };
    case 'CLEAR_QUEST_FROM_TEMPLATE':
      return { ...state, templateForQuest: null };
    case 'START_BOSS_FIGHT':
        return { ...state, activeBossFight: action.payload.questId };
    case 'END_BOSS_FIGHT':
        return { ...state, activeBossFight: null, bossFightVictoryData: null };
    case 'ADVANCE_TUTORIAL':
      return { ...state, tutorialStep: state.tutorialStep + 1 };
    case 'COMPLETE_TUTORIAL':
      return { 
          ...state, 
          tutorialStep: 0,
          toasts: [...state.toasts, { id: uuidv4(), message: "Tutorial complete! You're ready to begin.", type: 'success'}]
      };
    case 'TOGGLE_AI_CHAT': {
        const isOpening = !state.isAiChatOpen;
        if (isOpening && state.aiConversation.length === 0) {
            const welcomeMessage: AIMessage = {
                id: uuidv4(),
                sender: 'ai',
                text: `Hello, ${state.character.name}! I'm Spark, your AI companion. How can I help you strategize today?`
            };
            return { ...state, isAiChatOpen: true, aiConversation: [welcomeMessage] };
        }
        return { ...state, isAiChatOpen: !state.isAiChatOpen };
    }
    case 'ADD_AI_MESSAGE': {
        const { message } = action.payload;
        if (state.aiConversation.some(m => m.id === message.id)) {
            return {
                ...state,
                aiConversation: state.aiConversation.map(m => m.id === message.id ? message : m)
            };
        }
        return { ...state, aiConversation: [...state.aiConversation, message] };
    }
    default:
      return state;
  }
};