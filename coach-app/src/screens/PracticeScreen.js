import { View, Text, StyleSheet } from 'react-native';

export default function PracticeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Practice</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09101C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#38BDF8',
    fontSize: 24,
    fontWeight: 'bold',
  },
});