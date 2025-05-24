import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRiff } from '../contexts/RiffContext';
import MedalDisplay from '../components/MedalDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId, username } = route.params;
  const { user: currentUser } = useAuth();
  const { getUserRiffHistory } = useRiff();
  const [userProfile, setUserProfile] = useState(null);
  const [userRiffs, setUserRiffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      // Mock user profile data - in real app, fetch from API
      const profileData = {
        id: userId,
        username: username,
        email: isOwnProfile ? currentUser.email : null, // Don't show other users' emails
        totalMedals: { gold: 3, silver: 7, bronze: 12 },
        joinDate: '2024-01-15',
        totalRiffs: 89,
        totalLikes: 456,
        bestRank: 2,
      };

      // Get user's riff history
      const riffHistory = await getUserRiffHistory(userId);
      
      setUserProfile(profileData);
      setUserRiffs(riffHistory);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setLoading(false);
    }
  };

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isOwnProfile ? 'Your Profile' : `${username}'s Profile`}
        </Text>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>@{username}</Text>
        {userProfile.email && (
          <Text style={styles.email}>{userProfile.email}</Text>
        )}
        <Text style={styles.joinDate}>
          Member since {formatJoinDate(userProfile.joinDate)}
        </Text>
      </View>

      <MedalDisplay medals={userProfile.totalMedals} />

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.totalRiffs}</Text>
            <Text style={styles.statLabel}>Total Riffs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.totalLikes}</Text>
            <Text style={styles.statLabel}>Total Likes</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>#{userProfile.bestRank}</Text>
            <Text style={styles.statLabel}>Best Rank</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userRiffs.length}</Text>
            <Text style={styles.statLabel}>Recent Riffs</Text>
          </View>
        </View>
      </View>

      <View style={styles.riffsContainer}>
        <Text style={styles.sectionTitle}>
          {isOwnProfile ? 'Your Recent Riffs' : `${username}'s Recent Riffs`}
        </Text>
        
        {userRiffs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isOwnProfile ? 'You haven\'t posted any riffs yet' : 'No riffs posted yet'}
            </Text>
          </View>
        ) : (
          userRiffs.map((riff) => (
            <View key={riff.id} style={styles.riffCard}>
              <View style={styles.riffHeader}>
                <Text style={styles.riffDate}>
                  {new Date(riff.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.riffStats}>👍 {riff.likes}</Text>
              </View>
              <Text style={styles.riffPrompt}>"{riff.prompt}"</Text>
              <Text style={styles.riffContent}>{riff.content}</Text>
            </View>
          ))
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
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
  },
  riffsContainer: {
    margin: 15,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  riffCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  riffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riffDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  riffStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
  riffPrompt: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  riffContent: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  errorText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 20,
  },
});

export default UserProfileScreen;