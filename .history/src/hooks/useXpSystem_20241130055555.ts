// // a custom hook that applies tracks and updates the xp and level of the player and enemies
// // it is used to separate the game logic from the rendering and input handling code

// import { useEffect, useState } from 'react';
// import { useXpStore } from '../stores/xpStore';
// import { usePlayerStore } from '../stores/playerStore';
// import { useEnemyStore } from '../stores/enemyStore';

// const useXpSystem = () => {
//   const { xp, level, updateXp, updateLevel } = useXpStore();
//   const { player } = usePlayerStore();
//   const { enemies } = useEnemyStore();

//   const [playerXp, setPlayerXp] = useState(xp);
//   const [playerLevel, setPlayerLevel] = useState(level);

//   useEffect(() => {
//     setPlayerXp(xp);
//     setPlayerLevel(level);
//   }, [xp, level]);

//   const updatePlayerXp = (newXp: number) => {
//     updateXp(newXp);
//   };

//   const updatePlayerLevel = (newLevel: number) => {
//     updateLevel(newLevel);
//   };

//   const updateEnemyXp = (enemyId: string, newXp: number) => {
//     const enemyIndex = enemies.findIndex((enemy) => enemy.id === enemyId);
//     if (enemyIndex !== -1) {
//       enemies[enemyIndex].xp = newXp;
//     }
//   };

//   const updateEnemyLevel = (enemyId: string, newLevel: number) => {
//     const enemyIndex = enemies.findIndex((enemy) => enemy.id === enemyId);
//     if (enemyIndex !== -1) {
//       enemies[enemyIndex].level = newLevel;
//     }
//   };

//   return {
//     playerXp,
//     playerLevel,
//     updatePlayerXp,
//     updatePlayerLevel,
//     updateEnemyXp,
//     updateEnemyLevel,
//   };
// };

// export default useXpSystem;
// import { useEffect, useState } from 'react';
// import { useXpStore } from '../stores/xpStore';
// import { usePlayerStore } from '../stores/playerStore';
// import { useEnemyStore } from '../stores/enemyStore';

// const useXpSystem = () => {
//   const { xp, level, updateXp, updateLevel } = useXpStore();
//   const { player } = usePlayerStore();
//   const { enemies } = useEnemyStore();

//   const [playerXp, setPlayerXp] = useState(xp);
//   const [playerLevel, setPlayerLevel] = useState(level);

//   useEffect(() => {
//     setPlayerXp(xp);
//     setPlayerLevel(level);
//   }, [xp, level]);

//   const updatePlayerXp = (newXp: number) => {
//     updateXp(newXp);
//   };

//   const updatePlayerLevel = (newLevel: number) => {
//     updateLevel(newLevel);
//   };

//   const updateEnemyXp = (enemyId: string, newXp: number) => {
//     const enemyIndex = enemies.findIndex((enemy) => enemy.id === enemyId);
//     if (enemyIndex !== -1) {
//       enemies[enemyIndex].xp = newXp;
//     }
//   };

//   const updateEnemyLevel = (enemyId: string, newLevel: number) => {
//     const enemyIndex = enemies.findIndex((enemy) => enemy.id === enemyId);
//     if (enemyIndex !== -1) {
//       enemies[enemyIndex].level = newLevel;
//     }
//   };

//   return {
//     playerXp,
//     playerLevel,
//     updatePlayerXp,
//     updatePlayerLevel,
//     updateEnemyXp,
//     updateEnemyLevel,
//   };
// };

// export default useXpSystem;
