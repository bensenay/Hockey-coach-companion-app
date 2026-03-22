import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import useStore from '../store/useStore';

const LEVEL_COLORS = {
  'U7': { border: '#38BDF8', badge: 'rgba(56,189,248,0.12)', text: '#38BDF8' },
  'U9': { border: '#38BDF8', badge: 'rgba(56,189,248,0.12)', text: '#38BDF8' },
  'U11': { border: '#38BDF8', badge: 'rgba(56,189,248,0.12)', text: '#38BDF8' },
  'U13': { border: '#F97316', badge: 'rgba(249,115,22,0.12)', text: '#F97316' },
  'U15': { border: '#F97316', badge: 'rgba(249,115,22,0.12)', text: '#F97316' },
  'U18': { border: '#A855F7', badge: 'rgba(168,85,247,0.12)', text: '#A855F7' },
  'Junior': { border: '#F43F5E', badge: 'rgba(244,63,94,0.12)', text: '#F43F5E' },
  'Adult Rec': { border: '#F59E0B', badge: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  'default': { border: '#38BDF8', badge: 'rgba(56,189,248,0.12)', text: '#38BDF8' },
};

export default function DashboardScreen({ navigation }) {
  const teams = useStore(state => state.teams);
  const players = useStore(state => state.players);

  const getTeamPlayerCount = (teamId) =>
    players.filter(p => p.teamId === teamId).length;

  const getColors = (level) =>
    LEVEL_COLORS[level] || LEVEL_COLORS['default'];

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            Ice<Text style={styles.logoAccent}>Edge</Text>
          </Text>
          <Text style={styles.subtitle}>
            {teams.length} team{teams.length !== 1 ? 's' : ''} · {players.length} players
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* EMPTY STATE */}
        {teams.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏒</Text>
            <Text style={styles.emptyTitle}>No teams yet</Text>
            <Text style={styles.emptySub}>
              Head to the Roster tab to create your first team and add players.
            </Text>
          </View>
        )}

        {/* TEAM CARDS */}
        {teams.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Teams</Text>
            {teams.map(team => {
              const colors = getColors(team.level);
              const count = getTeamPlayerCount(team.id);
              return (
                <TouchableOpacity
                  key={team.id}
                  style={[styles.teamCard, { borderColor: colors.border }]}
                >
                  <View style={[styles.teamBadge, { backgroundColor: colors.badge }]}>
                    <Text style={[styles.teamBadgeText, { color: colors.text }]}>
                      {team.level}
                    </Text>
                  </View>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <View style={styles.teamMeta}>
                    <Text style={styles.teamMetaText}>🏒 {count} player{count !== 1 ? 's' : ''}</Text>
                    {team.season ? <Text style={styles.teamMetaText}>📅 {team.season}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* STATS */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsCard}>
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: '#38BDF8' }]}>{teams.length}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={[styles.statCell, styles.statCellBorder]}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{players.length}</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: '#F59E0B' }]}>
              {players.filter(p => p.status === 'healthy').length}
            </Text>
            <Text style={styles.statLabel}>Healthy</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#09101C' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 12,
  },
  logo: { fontWeight: '900', fontSize: 30, color: '#F9FAFB', letterSpacing: 0.5 },
  logoAccent: { color: '#38BDF8' },
  subtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderWidth: 2, borderColor: '#38BDF8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#38BDF8', fontWeight: '700', fontSize: 15 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyCard: {
    backgroundColor: '#111d2e', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
    padding: 30, alignItems: 'center', marginBottom: 20, marginTop: 10,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#F9FAFB', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#4B5563',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10,
  },
  teamCard: {
    backgroundColor: '#111d2e', borderWidth: 1,
    borderRadius: 14, padding: 16, marginBottom: 10,
  },
  teamBadge: {
    alignSelf: 'flex-start', paddingVertical: 2,
    paddingHorizontal: 10, borderRadius: 20, marginBottom: 6,
  },
  teamBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  teamName: { fontSize: 24, fontWeight: '800', color: '#F9FAFB', marginBottom: 4 },
  teamMeta: { flexDirection: 'row', gap: 14 },
  teamMetaText: { fontSize: 12, color: '#9CA3AF' },
  statsCard: {
    backgroundColor: '#111d2e', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
    flexDirection: 'row', overflow: 'hidden',
  },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statCellBorder: {
    borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
});