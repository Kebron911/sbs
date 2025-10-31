export interface Character {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  coins: number;
  streak: number;
  class: 'Architect' | 'Warrior' | 'Scholar' | 'Merchant' | 'Healer' | 'Inventor';
  inventory: string[]; // Holds IDs of purchased items
  unlockedBadges: UnlockedBadge[];
  attributes: {
    vitality: { value: number; maxValue: number };
    focus: { value: number; maxValue: number };
    discipline: { value: number; maxValue: number };
    creativity: { value: number; maxValue: number };
    wisdom: { value: number; maxValue: number };
    charisma: { value: number; maxValue: number };
  };
  equipment: {
    head: string | null;
    torso: string | null;
    legs: string | null;
  };
   appearance: {
    hairstyle: string; 
    hairColor: string; 
    eyeColor: string; 
    skinTone: string;
    bodyType: string;
    faceShape: string;
    eyeStyle: string;
    noseStyle: string;
    mouthStyle: string;
  };
  lastLogin: string | null;
  prestigeLevel: number;
  prestigePoints: number;
  purchasedPrestigeUpgrades: string[]; // IDs of purchased upgrades
  guildId: string | null;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  icon: string;
  description: string;
  perks: string[];
}

export enum HabitType {
  GOOD = 'GOOD',
  AFFLICTION = 'AFFLICTION',
}

export interface Habit {
  id: string;
  name:string;
  type: HabitType;
  skillId: string;
  xpValue: number;
  hpLoss?: number; // HP loss for bad habits
  streak: number;
  lastCheckedIn: string | null;
  stackWithHabitId?: string | null;
}

export enum QuestStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Objective {
  id: string;
  name: string;
  completed: boolean;
  xp: number;
}

export interface RecurrenceRule {
  frequency: 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  purpose: string;
  status: QuestStatus;
  deadline: string;
  objectives: Objective[];
  skillId: string;
  threatLevel: 'Minor' | 'Major' | 'Epic';
  goalId?: string;
  isHighLeverage?: boolean;
  recurrence?: RecurrenceRule;
  completions?: string[]; // Array of completion timestamps (ISO strings)
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
}


export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  icon: string;
  type: 'Boost' | 'Skin' | 'Avatar' | 'Gear';
}

export interface Gear extends Item {
    slot: 'head' | 'torso' | 'legs';
}


export interface GameEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'xp_gain' | 'hp_loss' | 'coin_gain' | 'item_get' | 'level_up' | 'badge_unlock' | 'wisdom_gain';
}

export interface VoidThought {
  id: string;
  text: string;
  createdAt: string;
}

export interface ChronicleEntry {
    id: string;
    content: string;
    summary: string;
    wisdomAwarded: number;
    timestamp: string;
}

export interface Reward {
  xp: number;
  coins: number;
  itemId?: string;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  totalXp: number;
  rank: number;
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  level: number;
  xp: number;
  avatarUrl: string; 
}

export enum FriendStatus {
    FRIEND = 'FRIEND',
    PENDING_IN = 'PENDING_IN', // Incoming request
    PENDING_OUT = 'PENDING_OUT', // Outgoing request
}

export interface Friend {
  id: string; // This will be the characterId of the friend
  name: string;
  avatarUrl: string; 
  level: number;
  status: FriendStatus;
}

export interface HabitTemplate {
  id: string;
  name: string;
  skillId: string;
  xpValue: number;
  type: HabitType;
}

export interface QuestTemplateObjective {
  name: string;
}
export interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  skillId: string;
  threatLevel: 'Minor' | 'Major' | 'Epic';
  objectives: QuestTemplateObjective[];
  category: string;
}


export interface HabitLogEntry {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'level' | 'streak' | 'questsCompleted' | 'habitsCompleted';
    value: number;
  };
  reward: Reward;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string;
}

export interface WeeklyReview {
    id: string;
    date: string; // YYYY-MM-DD
    wins: string;
    lessons: string;
    goals: string;
}

export interface FearSettingExercise {
    id: string;
    date: string; // YYYY-MM-DD
    questId: string;
    define: string;
    prevent: string;
    repair: string;
}

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'xp_boost' | 'coin_boost';
  value: number; // e.g., 0.1 for a 10% boost
}


// --- Settings Types ---
export type Theme = 'dark' | 'retro' | 'cyberpunk' | 'solari' | 'grove' | 'oceanic' | 'crimson' | 'synthwave' | 'steampunk' | 'monochrome';

export interface Settings {
  difficulty: 'Easy' | 'Normal' | 'Hard';
  theme: Theme;
  prestigeMode: boolean;
  xpGainRate: number; // Percentage
  dailyReminders: boolean;
  questDeadlines: boolean;
  habitCheckins: boolean;
  reminderTime: string; // "HH:MM" format
}

// --- Notification Types ---
export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error';
}

// --- AI Companion Types ---
export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
  interactive?: {
    type: 'create_quest_plan';
    data: {
      name: string;
      description: string;
      purpose: string;
      objectives: string[];
    };
  };
}

// --- State Management Types ---
export interface GameState {
  isOnboarded: boolean;
  character: Character;
  skills: Skill[];
  habits: Habit[];
  habitLogs: HabitLogEntry[];
  quests: Quest[];
  goals: Goal[];
  events: GameEvent[];
  theVoid: VoidThought[];
  chronicleEntries: ChronicleEntry[];
  weeklyReviews: WeeklyReview[];
  fearSettingExercises: FearSettingExercise[];
  settings: Settings;
  guilds: Guild[];
  friends: Friend[];
  reviewCalendarDate: string | null;
  // UI State managed by reducers
  rewardModalData: Reward | null;
  battleAnimationData: { hpLoss: number } | null;
  badgeNotification: Badge | null;
  dailyBriefing: { visible: boolean; bonus: Reward } | null;
  toasts: Toast[];
  templateForQuest: QuestTemplate | null;
  activeBossFight: string | null; // ID of the quest
  bossFightVictoryData: Reward | null;
  tutorialStep: number;
  isAiChatOpen: boolean;
  aiConversation: AIMessage[];
  loadingStates: { [key: string]: boolean };
}

// --- Action Types for Reducers ---
export type GameAction =
  | { type: 'SET_LOADING'; payload: { key: string; value: boolean } }
  | { type: 'APPLY_API_UPDATE'; payload: Partial<GameState> }
  // --- UI-only actions that don't need the API service ---
  | { type: 'COMPLETE_ONBOARDING_UI'; payload: { character: Character } }
  | { type: 'HIDE_REWARD_MODAL' }
  | { type: 'HIDE_BATTLE_ANIMATION' }
  | { type: 'HIDE_BADGE_NOTIFICATION' }
  | { type: 'HIDE_TOAST'; payload: { id: string } }
  | { type: 'SET_REVIEW_DATE'; payload: { date: string } }
  | { type: 'START_QUEST_FROM_TEMPLATE'; payload: { template: QuestTemplate } }
  | { type: 'CLEAR_QUEST_FROM_TEMPLATE' }
  | { type: 'START_BOSS_FIGHT'; payload: { questId: string } }
  | { type: 'END_BOSS_FIGHT' }
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'TOGGLE_AI_CHAT' }
  | { type: 'ADD_AI_MESSAGE'; payload: { message: AIMessage } };
