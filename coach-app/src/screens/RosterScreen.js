import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput, Alert
} from 'react-native';
import useStore from '../store/useStore';

const LEVELS = ['M13', 'M15', 'M18', 'Collegial', 'Junior'];
const DIVISIONS = ['D1', 'D1R', 'D2'];
const POSITIONS = ['F', 'D', 'G'];
const SHOOTS = ['L', 'R'];
const STATUS_COLORS = {
  healthy: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  injured: { bg: 'rgba(244,63,94,0.12)', text: '#F43F5E' },
  sick: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
};

export default function RosterScreen() {
  const { teams, players, addTeam, deleteTeam, addPlayer, updatePlayer, deletePlayer } = useStore();
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', level: 'M15', division: 'D1', season: '' });
  const [playerForm, setPlayerForm] = useState({ name: '', number: '', position: 'F', shoots: 'R' });

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const teamPlayers = players.filter(p => p.teamId === selectedTeamId);

  const handleAddTeam = () => {
    if (!teamForm.name.trim()) return Alert.alert('Missing info', 'Please enter a team name.');
    addTeam(teamForm);
    setTeamForm({ name: '', level: 'U15', season: '' });
    setShowTeamModal(false);
  };

  const handleAddPlayer = () => {
    if (!playerForm.name.trim()) return Alert.alert('Missing info', 'Please enter a player name.');
    if (!playerForm.number.trim()) return Alert.alert('Missing info', 'Please enter a jersey number.');
    addPlayer({ ...playerForm, teamId: selectedTeamId });
    setPlayerForm({ name: '', number: '', position: 'F', shoots: 'R' });
    setShowPlayerModal(false);
  };

  const cycleStatus = (player) => {
    const statuses = ['healthy', 'injured', 'sick'];
    const next = statuses[(statuses.indexOf(player.status) + 1) % statuses.length];
    updatePlayer(player.id, { status: next });
  };

  const confirmDeleteTeam = (team) => {
    Alert.alert('Delete Team', `Delete ${team.name} and all its players?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        players.filter(p => p.teamId === team.id).forEach(p => deletePlayer(p.id));
        deleteTeam(team.id);
        setSelectedTeamId(null);
      }},
    ]);
  };

  const confirmDeletePlayer = (player) => {
    Alert.alert('Remove Player', `Remove ${player.name} from the roster?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deletePlayer(player.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {selectedTeam ? selectedTeam.name : 'Ros'}
            <Text style={styles.titleAccent}>
              {selectedTeam ? '' : 'ter'}
            </Text>
          </Text>
          <Text style={styles.subtitle}>
            {selectedTeam
              ? `${teamPlayers.length} players · ${selectedTeam.level}`
              : `${teams.length} team${teams.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => selectedTeam ? setShowPlayerModal(true) : setShowTeamModal(true)}
        >
          <Text style={styles.addBtnText}>+ {selectedTeam ? 'Player' : 'Team'}</Text>
        </TouchableOpacity>
      </View>

      {/* TEAM SELECTOR */}
      {teams.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamTabs} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity
            style={[styles.teamTab, !selectedTeamId && styles.teamTabActive]}
            onPress={() => setSelectedTeamId(null)}
          >
            <Text style={[styles.teamTabText, !selectedTeamId && styles.teamTabTextActive]}>All</Text>
          </TouchableOpacity>
          {teams.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.teamTab, selectedTeamId === t.id && styles.teamTabActive]}
              onPress={() => setSelectedTeamId(t.id)}
            >
              <Text style={[styles.teamTabText, selectedTeamId === t.id && styles.teamTabTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* NO TEAMS */}
        {teams.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No teams yet</Text>
            <Text style={styles.emptySub}>Tap "+ Team" to create your first team.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowTeamModal(true)}>
              <Text style={styles.emptyBtnText}>+ Create Team</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ALL PLAYERS VIEW */}
        {!selectedTeamId && players.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>All Players · {players.length}</Text>
            <View style={styles.card}>
              {players.map((p, i) => (
                <PlayerRow key={p.id} player={p} team={teams.find(t => t.id === p.teamId)} onCycleStatus={cycleStatus} onDelete={confirmDeletePlayer} last={i === players.length - 1} />
              ))}
            </View>
          </>
        )}

        {/* TEAM PLAYERS VIEW */}
        {selectedTeamId && (
          <>
            {/* TEAM STATS */}
            <View style={styles.teamStatsRow}>
              {['healthy','injured','sick'].map(s => (
                <View key={s} style={[styles.teamStatCell, { backgroundColor: STATUS_COLORS[s].bg }]}>
                  <Text style={[styles.teamStatNum, { color: STATUS_COLORS[s].text }]}>
                    {teamPlayers.filter(p => p.status === s).length}
                  </Text>
                  <Text style={styles.teamStatLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                </View>
              ))}
            </View>

            {/* POSITION GROUPS */}
            {['F','D','G'].map(pos => {
              const group = teamPlayers.filter(p => p.position === pos);
              if (!group.length) return null;
              const labels = { F: 'Forwards', D: 'Defense', G: 'Goalies' };
              return (
                <View key={pos}>
                  <Text style={styles.sectionTitle}>{labels[pos]} · {group.length}</Text>
                  <View style={styles.card}>
                    {group.map((p, i) => (
                      <PlayerRow key={p.id} player={p} onCycleStatus={cycleStatus} onDelete={confirmDeletePlayer} last={i === group.length - 1} />
                    ))}
                  </View>
                </View>
              );
            })}

            {teamPlayers.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🏒</Text>
                <Text style={styles.emptyTitle}>No players yet</Text>
                <Text style={styles.emptySub}>Tap "+ Player" to add your first player.</Text>
              </View>
            )}

            {/* DELETE TEAM */}
            <TouchableOpacity style={styles.deleteTeamBtn} onPress={() => confirmDeleteTeam(selectedTeam)}>
              <Text style={styles.deleteTeamText}>🗑 Delete {selectedTeam.name}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ADD TEAM MODAL */}
      <Modal visible={showTeamModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Team</Text>

            <Text style={styles.inputLabel}>Team Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Nordiques"
              placeholderTextColor="#4B5563"
              value={teamForm.name}
              onChangeText={v => setTeamForm(f => ({ ...f, name: v }))}
            />

            <Text style={styles.inputLabel}>Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 6 }}>
              {LEVELS.map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.optionPill, teamForm.level === l && styles.optionPillActive]}
                  onPress={() => setTeamForm(f => ({ ...f, level: l }))}
                >
                  <Text style={[styles.optionPillText, teamForm.level === l && styles.optionPillTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Division</Text>
            <View style={styles.optionRow}>
              {DIVISIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.optionPill, teamForm.division === d && styles.optionPillActive]}
                  onPress={() => setTeamForm(f => ({ ...f, division: d }))}
                >
                  <Text style={[styles.optionPillText, teamForm.division === d && styles.optionPillTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Season (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2025-2026"
              placeholderTextColor="#4B5563"
              value={teamForm.season}
              onChangeText={v => setTeamForm(f => ({ ...f, season: v }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowTeamModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddTeam}>
                <Text style={styles.modalConfirmText}>Create Team</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD PLAYER MODAL */}
      <Modal visible={showPlayerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Player</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Tremblay"
              placeholderTextColor="#4B5563"
              value={playerForm.name}
              onChangeText={v => setPlayerForm(f => ({ ...f, name: v }))}
            />

            <Text style={styles.inputLabel}>Jersey Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 14"
              placeholderTextColor="#4B5563"
              keyboardType="numeric"
              value={playerForm.number}
              onChangeText={v => setPlayerForm(f => ({ ...f, number: v }))}
            />

            <Text style={styles.inputLabel}>Position</Text>
            <View style={styles.optionRow}>
              {POSITIONS.map(pos => (
                <TouchableOpacity
                  key={pos}
                  style={[styles.optionPill, playerForm.position === pos && styles.optionPillActive]}
                  onPress={() => setPlayerForm(f => ({ ...f, position: pos }))}
                >
                  <Text style={[styles.optionPillText, playerForm.position === pos && styles.optionPillTextActive]}>
                    {pos === 'F' ? 'Forward' : pos === 'D' ? 'Defense' : 'Goalie'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Shoots</Text>
            <View style={styles.optionRow}>
              {SHOOTS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.optionPill, playerForm.shoots === s && styles.optionPillActive]}
                  onPress={() => setPlayerForm(f => ({ ...f, shoots: s }))}
                >
                  <Text style={[styles.optionPillText, playerForm.shoots === s && styles.optionPillTextActive]}>
                    {s === 'L' ? 'Left' : 'Right'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPlayerModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddPlayer}>
                <Text style={styles.modalConfirmText}>Add Player</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PlayerRow({ player, team, onCycleStatus, onDelete, last }) {
  const sc = STATUS_COLORS[player.status];
  const posColors = { F: '#38BDF8', D: '#F97316', G: '#A855F7' };
  return (
    <View style={[styles.playerRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.playerNum}>
        <Text style={styles.playerNumText}>#{player.number}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerDetail}>
          {team ? `${team.name} · ` : ''}
          {player.shoots}H · {player.position === 'F' ? 'Forward' : player.position === 'D' ? 'Defense' : 'Goalie'}
        </Text>
      </View>
      <TouchableOpacity style={[styles.statusBadge, { backgroundColor: sc.bg }]} onPress={() => onCycleStatus(player)}>
        <Text style={[styles.statusText, { color: sc.text }]}>{player.status}</Text>
      </TouchableOpacity>
      <View style={[styles.posBadge, { backgroundColor: `${posColors[player.position]}18` }]}>
        <Text style={[styles.posText, { color: posColors[player.position] }]}>{player.position}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(player)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#09101C' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 10,
  },
  title: { fontSize: 30, fontWeight: '900', color: '#F9FAFB' },
  titleAccent: { color: '#38BDF8' },
  subtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  addBtn: { backgroundColor: '#38BDF8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  addBtnText: { color: '#09101C', fontWeight: '700', fontSize: 13 },
  teamTabs: { marginBottom: 10, paddingTop: 2 },
  teamTab: {
    paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: '#111d2e',
  },
  teamTabActive: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
  teamTabText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  teamTabTextActive: { color: '#09101C' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyCard: {
    backgroundColor: '#111d2e', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
    padding: 30, alignItems: 'center', marginTop: 10,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#F9FAFB', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  emptyBtn: { backgroundColor: '#38BDF8', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  emptyBtnText: { color: '#09101C', fontWeight: '700', fontSize: 13 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#4B5563',
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginBottom: 8, marginTop: 16,
  },
  card: {
    backgroundColor: '#111d2e', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  teamStatsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  teamStatCell: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  teamStatNum: { fontSize: 24, fontWeight: '800' },
  teamStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerNum: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(56,189,248,0.08)',
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  playerNumText: { color: '#38BDF8', fontWeight: '800', fontSize: 13 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: '600', color: '#F9FAFB' },
  playerDetail: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  statusBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  posBadge: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  posText: { fontSize: 11, fontWeight: '800' },
  deleteBtn: { padding: 4 },
  deleteBtnText: { color: '#4B5563', fontSize: 14 },
  deleteTeamBtn: {
    marginTop: 20, padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)',
    backgroundColor: 'rgba(244,63,94,0.06)', alignItems: 'center',
  },
  deleteTeamText: { color: '#F43F5E', fontWeight: '600', fontSize: 13 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#111d2e', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#F9FAFB', marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    backgroundColor: '#09101C', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', borderRadius: 10,
    padding: 12, color: '#F9FAFB', fontSize: 14, marginBottom: 14,
  },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  optionPill: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: '#09101C',
  },
  optionPillActive: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
  optionPillText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  optionPillTextActive: { color: '#09101C' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalCancel: {
    flex: 1, padding: 13, borderRadius: 12,
    backgroundColor: '#09101C', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center',
  },
  modalCancelText: { color: '#9CA3AF', fontWeight: '600', fontSize: 14 },
  modalConfirm: { flex: 1, padding: 13, borderRadius: 12, backgroundColor: '#38BDF8', alignItems: 'center' },
  modalConfirmText: { color: '#09101C', fontWeight: '700', fontSize: 14 },
});