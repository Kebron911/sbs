import { GameState, Badge, QuestStatus } from '../types';
import { MOCK_BADGES } from '../data/mockData';

export function checkAndUnlockBadges(
  oldState: GameState,
  newState: GameState
): { newState: GameState; unlockedBadge?: Badge } {
  // If nothing relevant changed, don't check for badges
  if (
    oldState.character.level === newState.character.level &&
    oldState.quests.length === newState.quests.length &&
    oldState.habitLogs.length === newState.habitLogs.length &&
    oldState.habits === newState.habits
  ) {
    return { newState };
  }

  const unlockedBadgeIds = new Set(newState.character.unlockedBadges.map(b => b.badgeId));
  const lockedBadges = MOCK_BADGES.filter(b => !unlockedBadgeIds.has(b.id));

  if (lockedBadges.length === 0) {
    return { newState };
  }

  const questsCompleted = newState.quests.filter(p => p.status === QuestStatus.ARCHIVED).length;
  const habitsCompleted = newState.habitLogs.length;
  const maxStreak = newState.habits.reduce((max, h) => Math.max(max, h.streak), 0);

  for (const badge of lockedBadges) {
    let criteriaMet = false;
    switch (badge.criteria.type) {
      case 'level':
        if (newState.character.level >= badge.criteria.value) criteriaMet = true;
        break;
      case 'questsCompleted':
        if (questsCompleted >= badge.criteria.value) criteriaMet = true;
        break;
      case 'habitsCompleted':
        if (habitsCompleted >= badge.criteria.value) criteriaMet = true;
        break;
      case 'streak':
        if (maxStreak >= badge.criteria.value) criteriaMet = true;
        break;
    }

    if (criteriaMet) {
      // Return the new state and the badge that was just unlocked
      // The root reducer will handle dispatching the UNLOCK_BADGE action
      return {
        newState,
        unlockedBadge: badge,
      };
    }
  }

  return { newState };
}