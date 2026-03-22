import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
  teams: [],
  players: [],

  // ─── TEAMS ────────────────────────────────────────
  addTeam: (team) => {
    const newTeam = {
      id: Date.now().toString(),
      name: team.name,
      level: team.level,
      season: team.season || '',
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().teams, newTeam];
    set({ teams: updated });
    AsyncStorage.setItem('teams', JSON.stringify(updated));
  },

  deleteTeam: (teamId) => {
    const updated = get().teams.filter(t => t.id !== teamId);
    set({ teams: updated });
    AsyncStorage.setItem('teams', JSON.stringify(updated));
  },

  // ─── PLAYERS ──────────────────────────────────────
  addPlayer: (player) => {
    const newPlayer = {
      id: Date.now().toString(),
      teamId: player.teamId,
      name: player.name,
      number: player.number,
      position: player.position,   // F, D, G
      line: player.line || '',
      shoots: player.shoots || 'R', // R or L
      status: 'healthy',            // healthy, injured, sick
      notes: '',
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().players, newPlayer];
    set({ players: updated });
    AsyncStorage.setItem('players', JSON.stringify(updated));
  },

  updatePlayer: (playerId, changes) => {
    const updated = get().players.map(p =>
      p.id === playerId ? { ...p, ...changes } : p
    );
    set({ players: updated });
    AsyncStorage.setItem('players', JSON.stringify(updated));
  },

  deletePlayer: (playerId) => {
    const updated = get().players.filter(p => p.id !== playerId);
    set({ players: updated });
    AsyncStorage.setItem('players', JSON.stringify(updated));
  },

  // ─── LOAD FROM STORAGE (call on app start) ────────
  loadData: async () => {
    try {
      const teams = await AsyncStorage.getItem('teams');
      const players = await AsyncStorage.getItem('players');
      set({
        teams: teams ? JSON.parse(teams) : [],
        players: players ? JSON.parse(players) : [],
      });
    } catch (e) {
      console.log('Error loading data:', e);
    }
  },
}));

export default useStore;