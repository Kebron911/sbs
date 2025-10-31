import { GameState, Habit, Quest, Objective, Gear, Item, ChronicleEntry, WeeklyReview, FearSettingExercise, Settings, VoidThought, QuestStatus, GameEvent, Character, Skill, Goal, PrestigeUpgrade, Guild, Friend, FriendStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { checkAndUnlockBadges } from '../utils/badgeSystem';
import { MOCK_PRESTIGE_UPGRADES, MOCK_ITEMS, MOCK_GEAR, MOCK_USERS } from '../data/mockData';

const API_LATENCY = 300; // ms

// --- Helper Functions (would live on a real backend) ---
function addEvent(events: GameEvent[], message: string, type: GameEvent['type']): GameEvent[] {
    const newEvent: GameEvent = { id: uuidv4(), timestamp: new Date().toISOString(), message, type };
    return [newEvent, ...events.slice(0, 49)];
}

function addXp(character: Character, amount: number): { character: Character; leveledUp: boolean } {
    let newXp = character.xp + amount;
    let newLevel = character.level;
    let oldLevel = character.level;
    let newXpToNext = character.xpToNextLevel;
    while (newXp >= newXpToNext) {
        newLevel++;
        newXp -= newXpToNext;
        newXpToNext = Math.floor(newXpToNext * 1.5);
    }
    return {
        character: { ...character, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext },
        leveledUp: newLevel > oldLevel,
    };
}

function calculateNextDeadline(rule: Quest['recurrence']): string {
    if (!rule) return new Date().toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    switch (rule.frequency) {
        case 'weekly': {
            const nextDate = new Date(today);
            if (rule.dayOfWeek !== undefined) {
                const daysUntilNext = (rule.dayOfWeek - today.getDay() + 7) % 7;
                const offset = daysUntilNext === 0 ? 7 : daysUntilNext;
                nextDate.setDate(today.getDate() + offset);
            } else {
                 nextDate.setDate(today.getDate() + 7);
            }
            return nextDate.toISOString().split('T')[0];
        }
        case 'monthly': {
            const nextMonthly = new Date(today);
            nextMonthly.setMonth(nextMonthly.getMonth() + 1);
            return nextMonthly.toISOString().split('T')[0];
        }
        case 'quarterly': {
            const nextQuarterly = new Date(today);
            nextQuarterly.setMonth(nextQuarterly.getMonth() + 3);
            return nextQuarterly.toISOString().split('T')[0];
        }
    }
}


// --- API Service Functions ---

// This function simulates an API call by waiting for a short duration.
const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), API_LATENCY));
};

export const apiCheckInHabit = async (state: GameState, habitId: string): Promise<Partial<GameState>> => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) throw new Error("Habit not found");

    const date = new Date().toISOString().split('T')[0];
    if (state.habitLogs.some(log => log.habitId === habitId && log.date === date)) {
        return { toasts: [...state.toasts, {id: uuidv4(), message: `Already completed "${habit.name}" today!`, type: 'info'}] };
    }

    // --- Logic from reducers ---
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasCheckedInYesterday = habit.lastCheckedIn ? new Date(habit.lastCheckedIn).toISOString().split('T')[0] === yesterday.toISOString().split('T')[0] : false;
    const newStreak = wasCheckedInYesterday ? habit.streak + 1 : 1;

    const newHabits = state.habits.map(h => h.id === habitId ? { ...h, streak: newStreak, lastCheckedIn: new Date().toISOString() } : h);
    const newHabitLogs = [...state.habitLogs, { habitId, date }];

    const prestigeXpBoost = state.character.purchasedPrestigeUpgrades.map(id => MOCK_PRESTIGE_UPGRADES.find(u => u.id === id)).filter((u): u is PrestigeUpgrade => !!u && u.type === 'xp_boost').reduce((total, u) => total + u.value, 1);
    const prestigeCoinBoost = state.character.purchasedPrestigeUpgrades.map(id => MOCK_PRESTIGE_UPGRADES.find(u => u.id === id)).filter((u): u is PrestigeUpgrade => !!u && u.type === 'coin_boost').reduce((total, u) => total + u.value, 1);
    
    const baseXp = habit.xpValue;
    const xpGain = Math.floor(baseXp * (state.settings.xpGainRate / 100) * prestigeXpBoost);
    const coinGain = Math.floor((baseXp / 2) * prestigeCoinBoost);
    
    const { character: charWithXp, leveledUp } = addXp(state.character, xpGain);
    const newCharacter = { ...charWithXp, coins: charWithXp.coins + coinGain };

    let newEvents = addEvent(state.events, `Gained ${xpGain} XP from "${habit.name}"`, 'xp_gain');
    if (leveledUp) {
        newEvents = addEvent(newEvents, `Reached Level ${newCharacter.level}!`, 'level_up');
    }

    const intermediateState = { ...state, character: newCharacter, habits: newHabits, habitLogs: newHabitLogs, events: newEvents };
    const { newState, unlockedBadge } = checkAndUnlockBadges(state, intermediateState);
    
    let finalUpdate: Partial<GameState> = { character: newState.character, habits: newState.habits, habitLogs: newState.habitLogs, events: newState.events };
    
    if (unlockedBadge) {
        const newUnlockedBadge = { badgeId: unlockedBadge.id, unlockedAt: new Date().toISOString() };
        finalUpdate.character!.unlockedBadges.push(newUnlockedBadge);
        finalUpdate.character!.coins += unlockedBadge.reward.coins;
        if(unlockedBadge.reward.xp > 0) {
            const { character: finalChar } = addXp(finalUpdate.character!, unlockedBadge.reward.xp);
            finalUpdate.character = finalChar;
        }
        finalUpdate.badgeNotification = unlockedBadge;
        finalUpdate.events = addEvent(newState.events, `Unlocked Badge: "${unlockedBadge.name}"!`, 'badge_unlock');
    }

    return simulateApiCall(finalUpdate);
};

export const apiFightAffliction = async (state: GameState, habitId: string): Promise<Partial<GameState>> => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit || !habit.hpLoss) throw new Error("Affliction not found");

    const newCharacter = { ...state.character, hp: Math.max(0, state.character.hp - habit.hpLoss) };
    const newEvents = addEvent(state.events, `Lost ${habit.hpLoss} HP in the fight against your affliction: '${habit.name}'`, 'hp_loss');

    return simulateApiCall({
        character: newCharacter,
        events: newEvents,
        battleAnimationData: { hpLoss: habit.hpLoss },
    });
};

export const apiToggleObjective = async (state: GameState, questId: string, objectiveId: string): Promise<Partial<GameState>> => {
    const quest = state.quests.find(q => q.id === questId);
    const objective = quest?.objectives.find(o => o.id === objectiveId);
    if (!quest || !objective) throw new Error("Quest or objective not found");

    const isCompleting = !objective.completed;
    let finalUpdate: Partial<GameState> = {};
    
    const newQuests = state.quests.map(q => {
        if (q.id === questId) {
            return { ...q, objectives: q.objectives.map(o => o.id === objectiveId ? { ...o, completed: isCompleting } : o) };
        }
        return q;
    });
    
    let intermediateState = { ...state, quests: newQuests };

    if (isCompleting) {
        // --- Calculate XP/Coins ---
        const prestigeXpBoost = state.character.purchasedPrestigeUpgrades.map(id => MOCK_PRESTIGE_UPGRADES.find(u => u.id === id)).filter((u): u is PrestigeUpgrade => !!u && u.type === 'xp_boost').reduce((total, u) => total + u.value, 1);
        const prestigeCoinBoost = state.character.purchasedPrestigeUpgrades.map(id => MOCK_PRESTIGE_UPGRADES.find(u => u.id === id)).filter((u): u is PrestigeUpgrade => !!u && u.type === 'coin_boost').reduce((total, u) => total + u.value, 1);

        const baseXp = objective.xp;
        const xpGain = Math.floor(baseXp * (state.settings.xpGainRate / 100) * prestigeXpBoost);
        const coinGain = Math.floor((baseXp / 2) * prestigeCoinBoost);
        
        const { character: charWithXp, leveledUp } = addXp(state.character, xpGain);
        const newCharacter = { ...charWithXp, coins: charWithXp.coins + coinGain };

        let newEvents = addEvent(state.events, `Completed objective for ${xpGain} XP`, 'xp_gain');
        if(leveledUp) newEvents = addEvent(newEvents, `Reached Level ${newCharacter.level}!`, 'level_up');
        
        intermediateState = { ...intermediateState, character: newCharacter, events: newEvents };

        // --- Check for Quest Completion ---
        const updatedQuest = intermediateState.quests.find(q => q.id === questId)!;
        const allObjectivesDone = updatedQuest.objectives.every(o => o.completed);

        if (allObjectivesDone) {
            const totalXp = quest.objectives.reduce((sum, o) => sum + o.xp, 0);
            const totalCoins = Math.floor(totalXp / 2);

            if (quest.recurrence) {
                const nextDeadline = calculateNextDeadline(quest.recurrence);
                intermediateState.quests = intermediateState.quests.map(q => q.id === questId ? { ...q, objectives: q.objectives.map(o => ({ ...o, completed: false })), deadline: nextDeadline, completions: [...(q.completions || []), new Date().toISOString()] } : q);
            } else {
                 intermediateState.quests = intermediateState.quests.map(q => q.id === questId ? { ...q, status: QuestStatus.ARCHIVED } : q);
            }

            if (quest.isHighLeverage) {
                finalUpdate.bossFightVictoryData = { xp: Math.floor(totalXp * 2), coins: totalCoins * 3 };
                finalUpdate.activeBossFight = null;
            } else {
                finalUpdate.rewardModalData = { xp: totalXp, coins: totalCoins };
            }
        }
    }
    
    // --- Badge Check ---
    const { newState, unlockedBadge } = checkAndUnlockBadges(state, intermediateState);
    finalUpdate = { ...finalUpdate, ...newState };

    if (unlockedBadge) {
       // Apply badge rewards logic here as well
    }

    return simulateApiCall(finalUpdate);
};

export const apiAddQuest = async (state: GameState, questData: any, voidThoughtIdToRemove?: string): Promise<Partial<GameState>> => {
    const newQuest: Quest = { id: uuidv4(), status: QuestStatus.IN_PROGRESS, ...questData };
    const newQuests = [newQuest, ...state.quests];
    const newTheVoid = voidThoughtIdToRemove ? state.theVoid.filter(t => t.id !== voidThoughtIdToRemove) : state.theVoid;
    return simulateApiCall({ quests: newQuests, theVoid: newTheVoid, toasts: [...state.toasts, {id: uuidv4(), message: `Quest "${newQuest.name}" has been forged!`, type: 'success'}] });
};

export const apiAddThoughtToTheVoid = async (state: GameState, text: string): Promise<Partial<GameState>> => {
    const newThought: VoidThought = { id: uuidv4(), text, createdAt: new Date().toISOString() };
    return simulateApiCall({ theVoid: [newThought, ...state.theVoid] });
};

export const apiAddHabit = async (state: GameState, habitData: any): Promise<Partial<GameState>> => {
    const newHabit: Habit = { id: uuidv4(), streak: 0, lastCheckedIn: null, ...habitData };
    return simulateApiCall({ habits: [newHabit, ...state.habits], toasts: [...state.toasts, {id: uuidv4(), message: `New habit "${newHabit.name}" created.`, type: 'success'}] });
};

// ... other API functions would follow the same pattern ...
export const apiUpdateHabit = async (state: GameState, habitId: string, habitData: Partial<Omit<Habit, 'id'>>): Promise<Partial<GameState>> => {
    const newHabits = state.habits.map(h => h.id === habitId ? { ...h, ...habitData } : h);
    return simulateApiCall({ habits: newHabits, toasts: [...state.toasts, {id: uuidv4(), message: 'Habit updated.', type: 'info'}] });
};
export const apiAddSkill = async (state: GameState, skillData: any): Promise<Partial<GameState>> => {
    const newSkill: Skill = { id: uuidv4(), level: 1, xp: 0, xpToNextLevel: 100, perks: [], ...skillData };
    return simulateApiCall({ skills: [...state.skills, newSkill] });
};
export const apiAddGoal = async (state: GameState, goalData: any): Promise<Partial<GameState>> => {
    const newGoal: Goal = { id: uuidv4(), status: 'IN_PROGRESS', ...goalData };
    return simulateApiCall({ goals: [newGoal, ...state.goals] });
};
export const apiUpdateGoal = async (state: GameState, goalId: string, goalData: Partial<Omit<Goal, 'id'>>): Promise<Partial<GameState>> => {
    const newGoals = state.goals.map(g => g.id === goalId ? { ...g, ...goalData } : g);
    return simulateApiCall({ goals: newGoals });
};
export const apiDeleteGoal = async (state: GameState, goalId: string): Promise<Partial<GameState>> => {
    const newGoals = state.goals.filter(g => g.id !== goalId);
    const newQuests = state.quests.map(q => q.goalId === goalId ? { ...q, goalId: undefined } : q);
    return simulateApiCall({ goals: newGoals, quests: newQuests });
};
export const apiUpdateCharacterAppearance = async (state: GameState, updates: Partial<Character['appearance']>): Promise<Partial<GameState>> => {
    const newCharacter = { ...state.character, appearance: { ...state.character.appearance, ...updates } };
    return simulateApiCall({ character: newCharacter });
};
export const apiEquipItem = async (state: GameState, item: Gear): Promise<Partial<GameState>> => {
    const newCharacter = { ...state.character, equipment: { ...state.character.equipment, [item.slot]: state.character.equipment[item.slot] === item.id ? null : item.id } };
    return simulateApiCall({ character: newCharacter });
};
export const apiPurchaseItem = async (state: GameState, itemId: string): Promise<Partial<GameState>> => {
    const item = [...MOCK_ITEMS, ...MOCK_GEAR].find(i => i.id === itemId);
    if (!item || state.character.coins < item.price) return { toasts: [...state.toasts, {id: uuidv4(), message: 'Not enough coins!', type: 'error'}]};
    
    let newCharacter = { ...state.character, coins: state.character.coins - item.price };
    if (item.type === 'Boost') { /* logic for boosts */ } 
    else { newCharacter.inventory = [...newCharacter.inventory, item.id]; }
    
    const newEvents = addEvent(state.events, `Purchased "${item.name}" for ${item.price} coins.`, 'item_get');
    return simulateApiCall({ character: newCharacter, events: newEvents, toasts: [...state.toasts, {id: uuidv4(), message: `Purchased "${item.name}"!`, type: 'success'}] });
};
export const apiUpdateSettings = async (state: GameState, newSettings: Partial<Settings>): Promise<Partial<GameState>> => {
    return simulateApiCall({ settings: { ...state.settings, ...newSettings } });
};
export const apiCompleteOnboarding = async (state: GameState, characterData: { name: string; }): Promise<Partial<GameState>> => {
    const newCharacter: Character = { ...state.character, id: uuidv4(), name: characterData.name, lastLogin: new Date().toISOString().split('T')[0] };
    const dailyBriefing = { visible: true, bonus: { xp: 50, coins: 25 } };
    return simulateApiCall({ isOnboarded: true, character: newCharacter, dailyBriefing: dailyBriefing, tutorialStep: 1 });
};
export const apiClaimDailyBonus = async (state: GameState): Promise<Partial<GameState>> => {
    if (!state.dailyBriefing) return {};
    const { bonus } = state.dailyBriefing;
    const { character: charWithXp } = addXp(state.character, bonus.xp);
    const newCharacter = { ...charWithXp, coins: charWithXp.coins + bonus.coins, lastLogin: new Date().toISOString().split('T')[0] };
    const newEvents = addEvent(state.events, `Claimed daily bonus of ${bonus.xp} XP and ${bonus.coins} coins!`, 'coin_gain');
    return simulateApiCall({ character: newCharacter, events: newEvents, dailyBriefing: null });
};
export const apiSubmitChronicleEntry = async (state: GameState, entry: ChronicleEntry): Promise<Partial<GameState>> => {
    const newWisdom = Math.min(state.character.attributes.wisdom.maxValue, state.character.attributes.wisdom.value + entry.wisdomAwarded);
    const newCharacter = { ...state.character, attributes: { ...state.character.attributes, wisdom: { ...state.character.attributes.wisdom, value: newWisdom } } };
    const newEntries = [entry, ...state.chronicleEntries];
    const newEvents = addEvent(state.events, `Gained ${entry.wisdomAwarded} Wisdom from chronicle entry.`, 'wisdom_gain');
    return simulateApiCall({ character: newCharacter, chronicleEntries: newEntries, events: newEvents, toasts: [...state.toasts, {id: uuidv4(), message: `Chronicle entry saved! (+${entry.wisdomAwarded} Wisdom)`, type: 'success'}] });
};
export const apiSaveWeeklyReview = async (state: GameState, reviewData: any): Promise<Partial<GameState>> => {
    const newReview: WeeklyReview = { id: uuidv4(), date: new Date().toISOString().split('T')[0], ...reviewData };
    return simulateApiCall({ weeklyReviews: [newReview, ...state.weeklyReviews], toasts: [...state.toasts, {id: uuidv4(), message: 'Weekly reflection saved!', type: 'success'}] });
};
export const apiSaveFearSetting = async (state: GameState, exerciseData: any): Promise<Partial<GameState>> => {
    const newExercise: FearSettingExercise = { id: uuidv4(), date: new Date().toISOString().split('T')[0], ...exerciseData };
    return simulateApiCall({ fearSettingExercises: [newExercise, ...state.fearSettingExercises], toasts: [...state.toasts, {id: uuidv4(), message: 'Fear-setting exercise saved!', type: 'success'}] });
};
export const apiPrestige = async (state: GameState): Promise<Partial<GameState>> => {
    if (state.character.level < 20) return {};
    const pointsEarned = Math.floor(state.character.level / 10);
    const newCharacter = { ...state.character, level: 1, xp: 0, xpToNextLevel: 100, coins: 0, prestigeLevel: state.character.prestigeLevel + 1, prestigePoints: state.character.prestigePoints + pointsEarned };
    const newSkills = state.skills.map(s => ({ ...s, level: 1, xp: 0, xpToNextLevel: 100, perks: [] }));
    const newEvents = addEvent(state.events, `You have prestiged! Your journey begins anew, but with greater wisdom.`, 'level_up');
    return simulateApiCall({ character: newCharacter, skills: newSkills, events: newEvents });
};
export const apiPurchasePrestigeUpgrade = async (state: GameState, upgrade: PrestigeUpgrade): Promise<Partial<GameState>> => {
    if (state.character.prestigePoints < upgrade.cost || state.character.purchasedPrestigeUpgrades.includes(upgrade.id)) return {};
    const newCharacter = { ...state.character, prestigePoints: state.character.prestigePoints - upgrade.cost, purchasedPrestigeUpgrades: [...state.character.purchasedPrestigeUpgrades, upgrade.id] };
    return simulateApiCall({ character: newCharacter });
};
export const apiJoinGuild = async (state: GameState, guildId: string): Promise<Partial<GameState>> => {
    const newCharacter = { ...state.character, guildId };
    return simulateApiCall({ character: newCharacter });
};
export const apiLeaveGuild = async (state: GameState): Promise<Partial<GameState>> => {
    return simulateApiCall({ character: { ...state.character, guildId: null } });
};
export const apiCreateGuild = async (state: GameState, guildData: any): Promise<Partial<GameState>> => {
    const newGuild: Guild = { id: uuidv4(), memberCount: 1, totalXp: 0, rank: state.guilds.length + 1, ...guildData };
    return simulateApiCall({ guilds: [...state.guilds, newGuild], character: { ...state.character, guildId: newGuild.id } });
};
export const apiAddFriend = async (state: GameState, friendId: string): Promise<Partial<GameState>> => {
    if (state.friends.some(f => f.id === friendId)) return {};
    const user = MOCK_USERS.find(u => u.id === friendId);
    if (!user) return {};
    const newFriend: Friend = { id: user.id, name: user.name, level: user.level, avatarUrl: (user as any).avatarUrl || '', status: FriendStatus.PENDING_OUT };
    return simulateApiCall({ friends: [...state.friends, newFriend] });
};
export const apiAcceptFriendRequest = async (state: GameState, friendId: string): Promise<Partial<GameState>> => {
    const newFriends = state.friends.map(f => f.id === friendId ? { ...f, status: FriendStatus.FRIEND } : f);
    return simulateApiCall({ friends: newFriends });
};
export const apiRemoveFriend = async (state: GameState, friendId: string): Promise<Partial<GameState>> => {
    const newFriends = state.friends.filter(f => f.id !== friendId);
    return simulateApiCall({ friends: newFriends });
};
