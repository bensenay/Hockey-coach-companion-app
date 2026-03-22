import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import DashboardScreen from './src/screens/DashboardScreen';
import RosterScreen from './src/screens/RosterScreen';
import DrillsScreen from './src/screens/DrillsScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import GameDayScreen from './src/screens/GameDayScreen';
import useStore from './src/store/useStore';

const Tab = createBottomTabNavigator();

export default function App() {
  const loadData = useStore(state => state.loadData);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0D1421',
            borderTopColor: 'rgba(255,255,255,0.07)',
            paddingBottom: 8,
            paddingTop: 6,
            height: 65,
          },
          tabBarActiveTintColor: '#38BDF8',
          tabBarInactiveTintColor: '#4B5563',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: '🏠',
              Roster: '👥',
              Drills: '🏒',
              Practice: '📋',
              GameDay: '⚔️',
            };
            return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
          },
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Roster" component={RosterScreen} />
        <Tab.Screen name="Drills" component={DrillsScreen} />
        <Tab.Screen name="Practice" component={PracticeScreen} />
        <Tab.Screen name="GameDay" component={GameDayScreen} options={{ title: 'Game Day' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}