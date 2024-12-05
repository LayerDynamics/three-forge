// systems/XpSystem.ts
// Purpose: Manages experience points(XP) acquisition,leveling,and related rewards for players or entities.
//	Responsibilities:
// Calculate and update XP based on specific actions(e.g.,defeating enemies,completing objectives).
Handle level-ups and trigger rewards(e.g.,unlocking abilities,increasing stats).
Provide utility functions for querying current XP,level thresholds,and rewards.
Depends On:
zustand for state management.
xpStore for storing and tracking XP-related state.
Interacts With:
LogicEngine to determine when XP should be awarded.
AbilitySystem to unlock new abilities on level-up.
playerStore to adjust stats on level-up.
