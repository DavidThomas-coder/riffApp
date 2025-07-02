import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRiff } from '../contexts/RiffContext';
import MedalDisplay from '../components/MedalDisplay';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { getUserRiffs, todaysRiffs } = useRiff();
  const [userRiffs, setUserRiffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRiffs = async () => {
      if (user?.id) {
        try {
          const riffs = await getUserRiffs(user.id);
          setUserRiffs(riffs || []);
        } catch (error) {
          console.error('Error loading user riffs:', error);
          setUserRiffs([]);
        }
      }
      setLoading(false);
    };

    loadUserRiffs();
  }, [user?.id, getUserRiffs]);

  const totalLikes = userRiffs.reduce((sum, riff) => sum + (riff.likes || 0), 0);

  // Mock additional stats - in a real app, these would come from the backend
  const mockUserStats = {
    totalRiffs: userRiffs.length,
    totalLikes: totalLikes,
    streak: 7,
    bestRank: 1,
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.joinDate}>Member since {mockUserStats.joinDate}</Text>
      </View>

      <MedalDisplay medals={user?.totalMedals || { gold: 0, silver: 0, bronze: 0 }} />

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUserStats.totalRiffs}</Text>
            <Text style={styles.statLabel}>Total Riffs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUserStats.totalLikes}</Text>
            <Text style={styles.statLabel}>Total Likes</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUserStats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>#{mockUserStats.bestRank}</Text>
            <Text style={styles.statLabel}>Best Rank</Text>
          </View>
        </View>
      </View>

      {userRiffs.length > 0 && (
        <View style={styles.todaysRiffsContainer}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.todayStats}>
            <View style={styles.todayStatItem}>
              <Text style={styles.todayStatNumber}>{userRiffs.length}</Text>
              <Text style={styles.todayStatLabel}>Riffs Today</Text>
            </View>
            <View style={styles.todayStatItem}>
              <Text style={styles.todayStatNumber}>{totalLikes}</Text>
              <Text style={styles.todayStatLabel}>Likes Today</Text>
            </View>
          </View>
          
          <View style={styles.recentRiffsContainer}>
            <Text style={styles.recentRiffsTitle}>Your Riffs Today:</Text>
            {userRiffs.map((riff, index) => (
              <View key={riff.id} style={styles.riffCard}>
                <Text style={styles.riffContent}>{riff.content}</Text>
                <View style={styles.riffFooter}>
                  <Text style={styles.riffStats}>👍 {riff.likes || 0} likes</Text>
                  <Text style={styles.riffTime}>
                    {new Date(riff.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  userInfo: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: '#C7C7CC',
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 5,
    textAlign: 'center',
  },
  todaysRiffsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  todayStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  todayStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  todayStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  todayStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 5,
  },
  recentRiffsContainer: {
    marginTop: 10,
  },
  recentRiffsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  riffCard: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  riffContent: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
    marginBottom: 10,
  },
  riffFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riffStats: {
    fontSize: 14,
    color: '#8E8E93',
  },
  riffTime: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  actionsContainer: {
    margin: 15,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;