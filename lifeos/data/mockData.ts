import { GameState, Character, Skill, Habit, Quest, Item, Gear, Badge, HabitTemplate, Settings, GameEvent, Guild, LeaderboardEntry, Friend, HabitType, QuestStatus, QuestTemplate, Goal, PrestigeUpgrade, FriendStatus } from '../types';

export const THREAT_LEVEL_XP_MAP = { Minor: 20, Major: 40, Epic: 80 };

export const MOCK_PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
    { id: 'pu1', name: 'Path of the Scholar', description: 'Permanently increase all XP gains by 10%.', cost: 1, type: 'xp_boost', value: 0.1 },
    { id: 'pu2', name: 'Merchant\'s Guild Charter', description: 'Permanently increase all Coin gains by 15%.', cost: 1, type: 'coin_boost', value: 0.15 },
    { id: 'pu3', name: 'Advanced Learning', description: 'Further increase all XP gains by another 10%. Stacks.', cost: 2, type: 'xp_boost', value: 0.1 },
    { id: 'pu4', name: 'Golden Touch', description: 'Further increase all Coin gains by another 15%. Stacks.', cost: 2, type: 'coin_boost', value: 0.15 },
];

export const MOCK_BADGES: Badge[] = [
    { id: 'b1', name: 'First Steps', description: 'Complete your first habit check-in.', icon: '👣', criteria: { type: 'habitsCompleted', value: 1 }, reward: { xp: 50, coins: 25 } },
    { id: 'b2', name: 'Quest Novice', description: 'Complete your first quest.', icon: '📜', criteria: { type: 'questsCompleted', value: 1 }, reward: { xp: 100, coins: 50 } },
    { id: 'b3', name: 'Level Up!', description: 'Reach Level 2.', icon: '⭐', criteria: { type: 'level', value: 2 }, reward: { xp: 0, coins: 100 } },
    { id: 'b4', name: 'Adept', description: 'Reach Level 5.', icon: '🌟', criteria: { type: 'level', value: 5 }, reward: { xp: 0, coins: 250, itemId: 'item1' } },
    { id: 'b5', name: 'On Fire!', description: 'Maintain a 7-day habit streak.', icon: '🔥', criteria: { type: 'streak', value: 7 }, reward: { xp: 200, coins: 100 } },
];

const MOCK_CHARACTER: Character = {
  id: 'char1',
  name: 'Valerius',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  hp: 85,
  maxHp: 100,
  coins: 1250,
  streak: 0,
  unlockedBadges: [],
  class: 'Warrior',
  inventory: ['gear1'],
  attributes: {
    vitality: { value: 7, maxValue: 10 },
    focus: { value: 5, maxValue: 10 },
    discipline: { value: 8, maxValue: 10 },
    creativity: { value: 4, maxValue: 10 },
    wisdom: { value: 6, maxValue: 10 },
    charisma: { value: 5, maxValue: 10 },
  },
  equipment: { head: 'gear2', torso: null, legs: null },
  appearance: {
    hairstyle: 'short01', hairColor: '#333333', eyeColor: '#5a82e8', skinTone: '#E0A358', bodyType: 'athletic',
    faceShape: 'oval', eyeStyle: 'standard', noseStyle: 'standard', mouthStyle: 'smile',
  },
  lastLogin: null,
  prestigeLevel: 0,
  prestigePoints: 0,
  purchasedPrestigeUpgrades: [],
  guildId: null,
};

const DEFAULT_SETTINGS: Settings = {
  difficulty: 'Normal', theme: 'dark', prestigeMode: false, xpGainRate: 100,
  dailyReminders: true, questDeadlines: true, habitCheckins: false, reminderTime: '09:00',
};

const MOCK_SKILLS: Skill[] = [
  { id: 'health', name: 'Health', level: 4, xp: 300, xpToNextLevel: 400, icon: '❤️', description: 'Improve physical and mental wellbeing.', perks: ['+5 Max HP', 'Increased Vitality recovery.'] },
  { id: 'work', name: 'Productivity', level: 6, xp: 150, xpToNextLevel: 600, icon: '💼', description: 'Enhance your professional capabilities.', perks: ['+10% Coin Gain on Quests', '+5 Focus'] },
  { id: 'finance', name: 'Finance', level: 3, xp: 50, xpToNextLevel: 300, icon: '💰', description: 'Master your financial life.', perks: ['-5% Shop Prices'] },
];

const MOCK_HABITS: Habit[] = [
  { id: 'h1', name: 'Morning Run', type: HabitType.GOOD, skillId: 'health', xpValue: 20, streak: 5, lastCheckedIn: '2023-10-26T10:00:00Z' },
  { id: 'h2', name: 'Read 10 pages', type: HabitType.GOOD, skillId: 'work', xpValue: 15, streak: 12, lastCheckedIn: '2023-10-26T10:00:00Z' },
  { id: 'h3', name: 'Eat Junk Food', type: HabitType.AFFLICTION, skillId: 'health', xpValue: 0, hpLoss: 10, streak: 0, lastCheckedIn: null },
];

export const MOCK_HABIT_TEMPLATES: HabitTemplate[] = [
    { id: 'ht1', name: '15-min walk', skillId: 'health', xpValue: 10, type: HabitType.GOOD },
    { id: 'ht2', name: 'Drink 8 glasses of water', skillId: 'health', xpValue: 15, type: HabitType.GOOD },
    { id: 'ht3', name: 'Plan your day', skillId: 'work', xpValue: 10, type: HabitType.GOOD },
];

export const MOCK_QUEST_TEMPLATES: QuestTemplate[] = [
    { id: 'qt1', name: 'Launch a Website', description: 'A complete plan for getting a new personal or business website live.', skillId: 'work', threatLevel: 'Epic', category: 'Productivity', objectives: [ { name: 'Define website goals & audience' }, { name: 'Choose a domain name and hosting' }, { name: 'Select a platform (e.g., WordPress, Squarespace)' }, { name: 'Design wireframes and mockups' }, { name: 'Develop the frontend' }, { name: 'Set up the backend & database' }, { name: 'Write and add content' }, { name: 'Test for responsiveness and bugs' }, { name: 'Deploy to live server' } ] },
    { id: 'qt2', name: 'Weekly Meal Prep', description: 'Plan and prepare your meals for the week to save time and eat healthier.', skillId: 'health', threatLevel: 'Major', category: 'Health', objectives: [ { name: 'Choose recipes for the week' }, { name: 'Create a grocery list' }, { name: 'Go grocery shopping' }, { name: 'Wash and chop all vegetables' }, { name: 'Cook proteins (chicken, beef, etc.)' }, { name: 'Cook grains (rice, quinoa)' }, { name: 'Portion meals into containers' } ] },
    { id: 'qt3', name: 'Monthly Financial Review', description: 'Review your budget, track spending, and plan for the next month.', skillId: 'finance', threatLevel: 'Minor', category: 'Finance', objectives: [ { name: 'Categorize all transactions from last month' }, { name: 'Compare spending against budget' }, { name: 'Pay all outstanding bills' }, { name: 'Review subscription services' }, { name: 'Set budget for the upcoming month' }, { name: 'Allocate funds to savings/investments' } ] },
];

const MOCK_GOALS: Goal[] = [
    { id: 'goal1', name: 'Improve Physical Health', description: 'Focus on consistent exercise and better nutrition this quarter.', icon: '💪', targetDate: '2024-03-31', status: 'IN_PROGRESS' },
    { id: 'goal2', name: 'Launch Side Project', description: 'Successfully launch the "LifeOS" application by the end of the year.', icon: '🚀', targetDate: '2023-12-31', status: 'IN_PROGRESS' },
];

const MOCK_QUESTS: Quest[] = [ {id: 'p1', name: 'Launch "LifeOS"', description: 'Complete all frontend and backend tasks for the new app.', purpose: 'To create a tool that helps people gamify their productivity and build better habits.', status: QuestStatus.IN_PROGRESS, deadline: '2023-12-31', skillId: 'work', threatLevel: 'Epic', isHighLeverage: true, goalId: 'goal2', objectives: [ {id: 't1', name: 'Design UI/UX', completed: true, xp: 50}, {id: 't2', name: 'Develop React Components', completed: false, xp: 100}, {id: 't3', name: 'Setup n8n backend', completed: false, xp: 150}, ]}, {id: 'p2', name: 'Gym Challenge', description: 'Go to the gym 3 times a week for a month.', purpose: 'To build a consistent workout routine and improve my physical health and energy levels.', status: QuestStatus.IN_PROGRESS, deadline: '2023-11-30', skillId: 'health', threatLevel: 'Major', goalId: 'goal1', objectives: [ {id: 't4', name: 'Week 1 Complete', completed: true, xp: 40}, {id: 't5', name: 'Week 2 Complete', completed: false, xp: 40}, ]} ];
export const MOCK_ITEMS: Item[] = [ {id: 'item1', name: 'XP Potion', description: 'Instantly gain 50 XP.', price: 100, rarity: 'Common', icon: '🧪', type: 'Boost'}, {id: 'item2', name: 'Gilded Armor', description: 'A cool new look for your avatar.', price: 500, rarity: 'Rare', icon: '👕', type: 'Skin'}, {id: 'item3', name: 'Epic Sword', description: 'A legendary sword for your profile.', price: 1000, rarity: 'Epic', icon: '⚔️', type: 'Avatar'} ];
export const MOCK_GEAR: Gear[] = [ {id: 'gear1', name: 'Leather Cap', description: '+1 Discipline', price: 50, rarity: 'Common', icon: '🧢', type: 'Gear', slot: 'head'}, {id: 'gear2', name: 'Iron Helmet', description: '+2 Vitality', price: 150, rarity: 'Uncommon', icon: '⛑️', type: 'Gear', slot: 'head'}, {id: 'gear3', name: 'Scholar\'s Robes', description: '+2 Wisdom', price: 150, rarity: 'Uncommon', icon: '👘', type: 'Gear', slot: 'torso'}, {id: 'gear4', name: 'Running Shoes', description: '+1 Vitality', price: 50, rarity: 'Common', icon: '👟', type: 'Gear', slot: 'legs'}, ];
export const MOCK_HAIRSTYLES = ['short01', 'long01', 'pony01', 'spiky01'];
export const MOCK_HAIR_COLORS = ['#333333', '#8D5524', '#C68642', '#E0A358', '#F1C27D', '#6A4E3A', '#B52323', '#3C8B3C'];
export const MOCK_EYE_COLORS = ['#5a82e8', '#85d67a', '#a16e4b', '#7a7a7a', '#c25b5b'];
export const MOCK_SKIN_TONES = ['#F1C27D', '#E0A358', '#C68642', '#8D5524', '#6A4E3A', '#3C2E1B'];
export const MOCK_BODY_TYPES = ['slim', 'athletic', 'heavy'];
export const MOCK_FACE_SHAPES = ['round', 'oval', 'square'];
export const MOCK_EYE_STYLES = ['standard', 'narrow', 'wide'];
export const MOCK_NOSE_STYLES = ['standard', 'wide', 'pointy'];
export const MOCK_MOUTH_STYLES = ['smile', 'neutral', 'frown'];
const MOCK_EVENTS: GameEvent[] = [ {id: 'e1', timestamp: '2023-10-27T10:05:00Z', message: 'Gained 20 XP from "Morning Run"', type: 'xp_gain'}, {id: 'e2', timestamp: '2023-10-27T09:00:00Z', message: 'Lost 10 HP from "Junk Food"', type: 'hp_loss'}, ];
export const MOCK_GUILDS: Guild[] = [ { id: 'g1', name: 'The Achievers', description: 'A guild for those who crush their goals.', icon: '🏆', memberCount: 24, totalXp: 150000, rank: 1 }, { id: 'g2', name: 'Habit Hackers', description: 'We build systems for success.', icon: '⚙️', memberCount: 15, totalXp: 95000, rank: 3 }, ];
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [ { rank: 1, characterId: 'char2', characterName: 'Zephyr', level: 10, xp: 10250, avatarUrl: 'https://picsum.photos/seed/zephyr/100' }, { rank: 2, characterId: 'char3', characterName: 'Aria', level: 9, xp: 9800, avatarUrl: 'https://picsum.photos/seed/aria/100' }, { rank: 3, characterId: 'char1', characterName: 'Valerius', level: 5, xp: 5120, avatarUrl: '' }, ];

export const MOCK_USERS: Character[] = [
    { ...MOCK_CHARACTER },
    { id: 'char2', name: 'Zephyr', level: 10, xp: 10250, avatarUrl: 'https://picsum.photos/seed/zephyr/100' } as any,
    { id: 'char3', name: 'Aria', level: 9, xp: 9800, avatarUrl: 'https://picsum.photos/seed/aria/100' } as any,
    { id: 'char4', name: 'Kael', level: 8, xp: 8200, avatarUrl: 'https://picsum.photos/seed/kael/100' } as any,
    { id: 'char5', name: 'Lyra', level: 7, xp: 7100, avatarUrl: 'https://picsum.photos/seed/lyra/100' } as any,
];

export const MOCK_FRIENDS: Friend[] = [ 
    { id: 'char2', name: 'Zephyr', avatarUrl: 'https://picsum.photos/seed/zephyr/100', level: 10, status: FriendStatus.FRIEND },
    { id: 'char4', name: 'Kael', avatarUrl: 'https://picsum.photos/seed/kael/100', level: 8, status: FriendStatus.PENDING_IN }, // Incoming request
    { id: 'char5', name: 'Lyra', avatarUrl: 'https://picsum.photos/seed/lyra/100', level: 7, status: FriendStatus.PENDING_OUT }, // Outgoing request
];


export const initialState: GameState = {
  isOnboarded: false,
  character: MOCK_CHARACTER,
  skills: MOCK_SKILLS,
  habits: MOCK_HABITS,
  habitLogs: [],
  quests: MOCK_QUESTS,
  goals: MOCK_GOALS,
  events: MOCK_EVENTS,
  theVoid: [],
  chronicleEntries: [],
  weeklyReviews: [],
  fearSettingExercises: [],
  settings: DEFAULT_SETTINGS,
  guilds: MOCK_GUILDS,
  friends: MOCK_FRIENDS,
  reviewCalendarDate: null,
  rewardModalData: null,
  battleAnimationData: null,
  badgeNotification: null,
  dailyBriefing: null,
  toasts: [],
  templateForQuest: null,
  activeBossFight: null,
  bossFightVictoryData: null,
  tutorialStep: 0,
  isAiChatOpen: false,
  aiConversation: [],
  loadingStates: {},
};