import React, { createContext, useContext, ReactNode, useReducer, useCallback } from 'react';
import { Character, Skill, Habit, Quest, Item, HabitType, Guild, LeaderboardEntry, Friend, Objective, Reward, Gear, HabitTemplate, Settings, Badge, GameState, QuestStatus, ChronicleEntry, Toast, WeeklyReview, FearSettingExercise, VoidThought, QuestTemplate, Goal, AIMessage, PrestigeUpgrade, FriendStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";
import { rootReducer } from '../reducers/rootReducer';
import { initialState, MOCK_ITEMS, MOCK_GEAR, MOCK_BADGES, MOCK_HABIT_TEMPLATES, MOCK_QUEST_TEMPLATES, MOCK_HAIRSTYLES, MOCK_HAIR_COLORS, MOCK_EYE_COLORS, MOCK_SKIN_TONES, MOCK_BODY_TYPES, MOCK_FACE_SHAPES, MOCK_EYE_STYLES, MOCK_NOSE_STYLES, MOCK_MOUTH_STYLES, MOCK_LEADERBOARD, THREAT_LEVEL_XP_MAP, MOCK_PRESTIGE_UPGRADES, MOCK_USERS } from '../data/mockData';
import * as apiService from '../services/apiService';


// --- CONTEXT DEFINITION ---
interface GameContextType extends Omit<GameState, 'loadingStates'> {
  // Add loading state getter
  getLoadingState: (key: string) => boolean;

  // Static data
  items: Item[];
  gear: Gear[];
  badges: Badge[];
  habitTemplates: HabitTemplate[];
  questTemplates: QuestTemplate[];
  prestigeUpgrades: PrestigeUpgrade[];
  hairstyles: string[];
  hairColors: string[];
  eyeColors: string[];
  skinTones: string[];
  bodyTypes: string[];
  faceShapes: string[];
  eyeStyles: string[];
  noseStyles: string[];
  mouthStyles: string[];
  leaderboard: LeaderboardEntry[];
  users: Character[];
  
  // Dispatcher functions
  getSkill: (skillId: string) => Skill | undefined;
  checkInHabit: (habitId: string) => Promise<void>;
  fightAffliction: (habitId: string) => Promise<void>;
  toggleObjective: (questId: string, objectiveId: string) => Promise<void>;
  addQuest: (questData: Omit<Quest, 'id' | 'status' | 'objectives'> & { objectives: Omit<Objective, 'id' | 'completed' | 'xp'>[] }, voidThoughtIdToRemove?: string) => Promise<void>;
  addThoughtToTheVoid: (text: string) => Promise<void>;
  addHabit: (habitData: Omit<Habit, 'id' | 'streak' | 'lastCheckedIn'>) => Promise<void>;
  updateHabit: (habitId: string, habitData: Partial<Omit<Habit, 'id'>>) => Promise<void>;
  addHabitFromTemplate: (template: HabitTemplate) => Promise<void>;
  addSkill: (skillData: Omit<Skill, 'id' | 'level' | 'xp' | 'xpToNextLevel' | 'perks'>) => Promise<void>;
  addGoal: (goalData: Omit<Goal, 'id' | 'status'>) => Promise<void>;
  updateGoal: (goalId: string, goalData: Partial<Omit<Goal, 'id'>>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateCharacterAppearance: (updates: Partial<Character['appearance']>) => Promise<void>;
  equipItem: (item: Gear) => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  hideRewardModal: () => void;
  hideBattleAnimation: () => void;
  hideBadgeNotification: () => void;
  completeOnboarding: (characterData: { name: string; }) => Promise<void>;
  claimDailyBonus: () => Promise<void>;
  analyzeChronicleEntry: (entry: string) => Promise<void>;
  saveWeeklyReview: (reviewData: Omit<WeeklyReview, 'id' | 'date'>) => Promise<void>;
  saveFearSettingExercise: (exerciseData: Omit<FearSettingExercise, 'id' | 'date'>) => Promise<void>;
  showToast: (payload: { message: string; type: Toast['type'] }) => void;
  hideToast: (id: string) => void;
  setReviewDate: (date: string) => void;
  startQuestFromTemplate: (template: QuestTemplate) => void;
  clearTemplateForQuest: () => void;
  startBossFight: (questId: string) => void;
  endBossFight: () => void;
  advanceTutorial: () => void;
  completeTutorial: () => void;
  toggleAiChat: () => void;
  sendAiMessage: (message: string, contextPath: string) => Promise<void>;
  prestige: () => Promise<void>;
  purchasePrestigeUpgrade: (upgrade: PrestigeUpgrade) => Promise<void>;
  joinGuild: (guildId: string) => Promise<void>;
  leaveGuild: () => Promise<void>;
  createGuild: (guildData: Omit<Guild, 'id' | 'memberCount' | 'totalXp' | 'rank'>) => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  acceptFriendRequest: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  const handleApiCall = useCallback(async <T extends any[]>(
    key: string,
    apiFn: (state: GameState, ...args: T) => Promise<Partial<GameState>>,
    ...args: T
  ) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value: true } });
    try {
      // Pass the current state to the API function
      const update = await apiFn(state, ...args);
      dispatch({ type: 'APPLY_API_UPDATE', payload: update });
    } catch (error) {
      console.error(`API call for ${key} failed:`, error);
      showToast({ message: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key, value: false } });
    }
  }, [state]); // Dependency on state to ensure apiFn gets the latest state


  // --- Gemini API Integration ---
  const analyzeChronicleEntry = async (entry: string) => {
    const key = 'analyzeChronicle';
    dispatch({ type: 'SET_LOADING', payload: { key, value: true } });
    showToast({ message: 'AI is analyzing your entry...', type: 'info' });
    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
      
      const activeQuests = state.quests.filter(p => p.status === QuestStatus.IN_PROGRESS).map(p => p.name).join(', ') || 'None';
      const highestStreak = state.habits.reduce((max, h) => Math.max(max, h.streak), 0);

      const contextSummary = `Current Character Status: - Level: ${state.character.level}, - Class: ${state.character.class}, - Active Quests: ${activeQuests}, - Highest Habit Streak: ${highestStreak} days`;
      const prompt = `Analyze the following chronicle entry for its reflective depth, sentiment, and connection to productivity or personal growth. Based on the analysis, award a 'wisdom' score between 5 and 25. Return the response as a JSON object with this structure: { "wisdomAward": number, "briefSummary": string }. Context: ${contextSummary}. Entry: "${entry}"`;
      
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { wisdomAward: { type: Type.NUMBER }, briefSummary: { type: Type.STRING } }, required: ['wisdomAward', 'briefSummary'] } } });
      const resultJson = JSON.parse(response.text);
      const { wisdomAward, briefSummary } = resultJson;
      
      if (typeof wisdomAward === 'number' && wisdomAward > 0) {
        const newEntry: ChronicleEntry = { id: uuidv4(), content: entry, summary: briefSummary, wisdomAwarded: wisdomAward, timestamp: new Date().toISOString() };
        await handleApiCall('submitChronicle', apiService.apiSubmitChronicleEntry, newEntry);
      } else { throw new Error('Invalid wisdom value received from AI.'); }
    } catch (error) {
      console.error("Gemini API Error:", error);
      showToast({ message: 'AI analysis failed. Please try again.', type: 'error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key, value: false } });
    }
  };

  const sendAiMessage = async (message: string, contextPath: string) => {
    // This function remains largely the same as it handles its own UI state updates for the chat
    // For brevity, the implementation is kept from the original file but would work with this new structure
     const userMessage: AIMessage = { id: uuidv4(), sender: 'user', text: message };
    dispatch({ type: 'ADD_AI_MESSAGE', payload: { message: userMessage } });
    const loadingMessage: AIMessage = { id: uuidv4(), sender: 'ai', text: '', isLoading: true };
    dispatch({ type: 'ADD_AI_MESSAGE', payload: { message: loadingMessage } });
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        let systemInstruction = `You are an AI companion in a productivity RPG called LifeOS. Your name is Spark. You are helpful, encouraging, and context-aware. The user's name is ${state.character.name}.`;
        const questSchema = { type: Type.OBJECT, properties: { isQuestPlan: { type: Type.BOOLEAN }, questName: { type: Type.STRING }, questDescription: { type: Type.STRING }, questPurpose: { type: Type.STRING }, objectives: { type: Type.ARRAY, items: { type: Type.STRING } }, responseText: { type: Type.STRING } } };
        let prompt = `The user says: "${message}"`;
        let responseSchema = undefined;
        if (contextPath.includes('/quests')) {
            systemInstruction += ` You are currently on the Quests screen... If the user asks for help creating a quest, you MUST respond with a JSON object following the provided schema. Otherwise, respond with a normal text message.`;
            responseSchema = questSchema;
        } else if (contextPath.includes('/goals')) { systemInstruction += ` You are on the Goals screen...`; } 
        else { systemInstruction += ` You are on the main dashboard...`; }
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, responseMimeType: responseSchema ? "application/json" : undefined, responseSchema: responseSchema } });
        let aiResponse: AIMessage;
        try {
            const resultJson = JSON.parse(response.text);
            if (resultJson.isQuestPlan) {
                aiResponse = { id: loadingMessage.id, sender: 'ai', text: resultJson.responseText, interactive: { type: 'create_quest_plan', data: { name: resultJson.questName, description: resultJson.questDescription, purpose: resultJson.questPurpose, objectives: resultJson.objectives } } };
            } else { aiResponse = { id: loadingMessage.id, sender: 'ai', text: resultJson.responseText || response.text }; }
        } catch (e) { aiResponse = { id: loadingMessage.id, sender: 'ai', text: response.text }; }
        dispatch({ type: 'ADD_AI_MESSAGE', payload: { message: aiResponse } });
    } catch (error) {
        console.error("AI Companion Error:", error);
        const errorMessage: AIMessage = { id: loadingMessage.id, sender: 'ai', text: "Sorry, I encountered an error. Please try again." };
        dispatch({ type: 'ADD_AI_MESSAGE', payload: { message: errorMessage } });
    }
  };

  // --- Wrapped Dispatcher Functions ---
  const getSkill = (skillId: string) => state.skills.find(s => s.id === skillId);
  const getLoadingState = (key: string) => !!state.loadingStates[key];

  // API-driven actions
  const checkInHabit = (habitId: string) => handleApiCall(`habit-${habitId}`, apiService.apiCheckInHabit, habitId);
  const fightAffliction = (habitId: string) => handleApiCall(`habit-${habitId}`, apiService.apiFightAffliction, habitId);
  const toggleObjective = (questId: string, objectiveId: string) => handleApiCall(`objective-${objectiveId}`, apiService.apiToggleObjective, questId, objectiveId);
  const addQuest = (questData: Omit<Quest, 'id' | 'status' | 'objectives'> & { objectives: Omit<Objective, 'id' | 'completed' | 'xp'>[] }, voidThoughtIdToRemove?: string) => handleApiCall('addQuest', apiService.apiAddQuest, questData, voidThoughtIdToRemove);
  const addThoughtToTheVoid = (text: string) => handleApiCall('addThought', apiService.apiAddThoughtToTheVoid, text);
  const addHabit = async (habitData: Omit<Habit, 'id' | 'streak' | 'lastCheckedIn'>) => {
    if (state.tutorialStep > 0) {
      dispatch({ type: 'COMPLETE_TUTORIAL' });
    }
    await handleApiCall('addHabit', apiService.apiAddHabit, habitData);
  };
  const updateHabit = (habitId: string, habitData: Partial<Omit<Habit, 'id'>>) => handleApiCall(`updateHabit-${habitId}`, apiService.apiUpdateHabit, habitId, habitData);
  const addHabitFromTemplate = async (template: HabitTemplate) => {
    const habitData = { name: template.name, type: template.type, skillId: template.skillId, xpValue: template.xpValue, hpLoss: template.type === HabitType.AFFLICTION ? 10 : undefined };
    await addHabit(habitData);
  };
  const addSkill = (skillData: Omit<Skill, 'id' | 'level' | 'xp' | 'xpToNextLevel' | 'perks'>) => handleApiCall('addSkill', apiService.apiAddSkill, skillData);
  const addGoal = (goalData: Omit<Goal, 'id' | 'status'>) => handleApiCall('addGoal', apiService.apiAddGoal, goalData);
  const updateGoal = (goalId: string, goalData: Partial<Omit<Goal, 'id'>>) => handleApiCall(`updateGoal-${goalId}`, apiService.apiUpdateGoal, goalId, goalData);
  const deleteGoal = (goalId: string) => handleApiCall(`deleteGoal-${goalId}`, apiService.apiDeleteGoal, goalId);
  const updateCharacterAppearance = (updates: Partial<Character['appearance']>) => handleApiCall('updateAppearance', apiService.apiUpdateCharacterAppearance, updates);
  const equipItem = (item: Gear) => handleApiCall(`equip-${item.id}`, apiService.apiEquipItem, item);
  const purchaseItem = (itemId: string) => handleApiCall(`purchase-${itemId}`, apiService.apiPurchaseItem, itemId);
  const updateSettings = (newSettings: Partial<Settings>) => handleApiCall('updateSettings', apiService.apiUpdateSettings, newSettings);
  const completeOnboarding = (characterData: { name: string; }) => handleApiCall('onboarding', apiService.apiCompleteOnboarding, characterData);
  const claimDailyBonus = () => handleApiCall('claimBonus', apiService.apiClaimDailyBonus);
  const saveWeeklyReview = (reviewData: Omit<WeeklyReview, 'id' | 'date'>) => handleApiCall('saveReview', apiService.apiSaveWeeklyReview, reviewData);
  const saveFearSettingExercise = (exerciseData: Omit<FearSettingExercise, 'id' | 'date'>) => handleApiCall('saveFearSetting', apiService.apiSaveFearSetting, exerciseData);
  const prestige = () => handleApiCall('prestige', apiService.apiPrestige);
  const purchasePrestigeUpgrade = (upgrade: PrestigeUpgrade) => handleApiCall(`purchasePrestige-${upgrade.id}`, apiService.apiPurchasePrestigeUpgrade, upgrade);
  const joinGuild = (guildId: string) => handleApiCall(`joinGuild-${guildId}`, apiService.apiJoinGuild, guildId);
  const leaveGuild = () => handleApiCall('leaveGuild', apiService.apiLeaveGuild);
  const createGuild = (guildData: Omit<Guild, 'id' | 'memberCount' | 'totalXp' | 'rank'>) => handleApiCall('createGuild', apiService.apiCreateGuild, guildData);
  const addFriend = (friendId: string) => handleApiCall(`addFriend-${friendId}`, apiService.apiAddFriend, friendId);
  const acceptFriendRequest = (friendId: string) => handleApiCall(`acceptFriend-${friendId}`, apiService.apiAcceptFriendRequest, friendId);
  const removeFriend = (friendId: string) => handleApiCall(`removeFriend-${friendId}`, apiService.apiRemoveFriend, friendId);

  // UI-only actions (no API call needed)
  const hideRewardModal = () => dispatch({ type: 'HIDE_REWARD_MODAL' });
  const hideBattleAnimation = () => dispatch({ type: 'HIDE_BATTLE_ANIMATION' });
  const hideBadgeNotification = () => dispatch({ type: 'HIDE_BADGE_NOTIFICATION' });
  const showToast = (payload: { message: string; type: Toast['type'] }) => {
    const newToast = { id: uuidv4(), ...payload };
    dispatch({ type: 'APPLY_API_UPDATE', payload: { toasts: [...state.toasts, newToast] }});
  };
  const hideToast = (id: string) => dispatch({ type: 'HIDE_TOAST', payload: { id } });
  const setReviewDate = (date: string) => dispatch({ type: 'SET_REVIEW_DATE', payload: { date } });
  const startQuestFromTemplate = (template: QuestTemplate) => dispatch({ type: 'START_QUEST_FROM_TEMPLATE', payload: { template } });
  const clearTemplateForQuest = () => dispatch({ type: 'CLEAR_QUEST_FROM_TEMPLATE' });
  const startBossFight = (questId: string) => dispatch({ type: 'START_BOSS_FIGHT', payload: { questId } });
  const endBossFight = () => dispatch({ type: 'END_BOSS_FIGHT' });
  const advanceTutorial = () => dispatch({ type: 'ADVANCE_TUTORIAL' });
  const completeTutorial = () => dispatch({ type: 'COMPLETE_TUTORIAL' });
  const toggleAiChat = () => dispatch({ type: 'TOGGLE_AI_CHAT' });

  const { loadingStates, ...restOfState } = state;
  const value = {
    ...restOfState,
    getLoadingState,
    items: MOCK_ITEMS, gear: MOCK_GEAR, badges: MOCK_BADGES, habitTemplates: MOCK_HABIT_TEMPLATES, questTemplates: MOCK_QUEST_TEMPLATES,
    prestigeUpgrades: MOCK_PRESTIGE_UPGRADES,
    hairstyles: MOCK_HAIRSTYLES, hairColors: MOCK_HAIR_COLORS, eyeColors: MOCK_EYE_COLORS, skinTones: MOCK_SKIN_TONES,
    bodyTypes: MOCK_BODY_TYPES, faceShapes: MOCK_FACE_SHAPES, eyeStyles: MOCK_EYE_STYLES, noseStyles: MOCK_NOSE_STYLES,
    mouthStyles: MOCK_MOUTH_STYLES, leaderboard: MOCK_LEADERBOARD, users: MOCK_USERS,
    getSkill, checkInHabit, fightAffliction, toggleObjective, addQuest, addThoughtToTheVoid, addHabit, updateHabit,
    addHabitFromTemplate, addSkill, addGoal, updateGoal, deleteGoal, updateCharacterAppearance, equipItem, purchaseItem, updateSettings, hideRewardModal,
    hideBattleAnimation, hideBadgeNotification, completeOnboarding, claimDailyBonus, analyzeChronicleEntry, showToast, hideToast,
    setReviewDate, saveWeeklyReview, saveFearSettingExercise, startQuestFromTemplate, clearTemplateForQuest,
    startBossFight, endBossFight, advanceTutorial, completeTutorial,
    toggleAiChat, sendAiMessage, prestige, purchasePrestigeUpgrade,
    joinGuild, leaveGuild, createGuild, addFriend, acceptFriendRequest, removeFriend,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};