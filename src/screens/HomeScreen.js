import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRiff } from '../contexts/RiffContext';
import { useAuth } from '../contexts/AuthContext';
import RiffCard from '../components/RiffCard';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSpinner from '../components/LoadingSpinner';

const HomeScreen = () => {
  const { dailyPrompt, todaysRiffs, loading, refreshData, voteOnRiff } = useRiff();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleVote = async (riffId, currentlyVoted) => {
    // Don't allow voting on own riffs
    const riff = todaysRiffs.find(r => r.id === riffId);
    if (riff && riff.userId === user?.id) {
      Alert.alert('Info', 'You cannot vote on your own riff');
      return;
    }

    const result = await voteOnRiff(riffId, !currentlyVoted);
    if (!result.success) {
      Alert.alert('Error', 'Failed to vote on riff');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Today's Riff</Text>
        <Text style={styles.greeting}>Hey {user?.username}! 👋</Text>
        {dailyPrompt && <CountdownTimer resetTime={dailyPrompt.resetTime} />}
      </View>

      {dailyPrompt && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptLabel}>Today's Prompt:</Text>
          <Text style={styles.promptText}>{dailyPrompt.text}</Text>
        </View>
      )}

      <View style={styles.riffsContainer}>
        <Text style={styles.sectionTitle}>
          Today's Riffs ({todaysRiffs.length})
        </Text>
        {todaysRiffs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No riffs yet today!</Text>
            <Text style={styles.emptySubtext}>Be the first to riff on today's prompt</Text>
          </View>
        ) : (
          todaysRiffs.map(riff => (
            <RiffCard
              key={riff.id}
              riff={riff}
              onVote={() => handleVote(riff.id, riff.hasVoted)}
              isOwnRiff={riff.userId === user?.id}
            />
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
    marginBottom: 5,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 10,
  },
  promptContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 18,
    color: '#000',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  riffsContainer: {
    paddingVertical: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
  },
});

export default HomeScreen;