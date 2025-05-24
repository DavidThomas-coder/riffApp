import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { RiffProvider } from './src/contexts/RiffContext';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateRiffScreen from './src/screens/CreateRiffScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoadingSpinner from './src/components/LoadingSpinner';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopColor: '#E5E5EA',
        borderTopWidth: 1,
      },
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        tabBarLabel: 'Today\'s Riff',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
      }}
    />
    <Tab.Screen 
      name="Create" 
      component={CreateRiffScreen}
      options={{
        tabBarLabel: 'Create',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>✏️</Text>,
      }}
    />
    <Tab.Screen 
      name="Leaderboard" 
      component={LeaderboardScreen}
      options={{
        tabBarLabel: 'Rankings',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏆</Text>,
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RiffProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </RiffProvider>
    </AuthProvider>
  );
}