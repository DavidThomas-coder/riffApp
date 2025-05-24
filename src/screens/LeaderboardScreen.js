import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRiff } from '../contexts/RiffContext';
import { useAuth } from '../contexts/AuthContext';
import LeaderboardItem from '../components/LeaderboardItem';
import LoadingSpinner from '../components/LoadingSpinner';

const LeaderboardScreen = () => {
  const { leaderboard, loading, refreshData } = useRiff();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getUserRank = () => {
    const userEntry = leaderboard.find(entry => entry.userId === user?.id);
    return userEntry ? userEntry.rank : null;
  };

  const userRank = getUserRank();

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
        <Text style={styles.title}>Today's Leaderboard</Text>
        <Text style={styles.subtitle}>Rankings reset daily at 4 AM UTC</Text>
        {userRank && (
          <View style={styles.userRankContainer}>
            <Text style={styles.userRankText}>
              Your rank: #{userRank}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.leaderboardContainer}>
        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No riffs submitted yet today!</Text>
            <Text style={styles.emptySubtext}>
              Submit a riff to appear on the leaderboard
            </Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <View style={styles.podiumContainer}>
                <Text style={styles.podiumTitle}>Today's Winners</Text>
                <View style={styles.podium}>
                  {/* 2nd Place */}
                  <View style={[styles.podiumSpot, styles.secondPlace]}>
                    <Text style={styles.podiumEmoji}>🥈</Text>
                    <Text style={styles.podiumUsername}>
                      @{leaderboard[1].username}
                    </Text>
                    <Text style={styles.podiumLikes}>
                      {leaderboard[1].todayLikes} 👍
                    </Text>
                  </View>
                  
                  {/* 1st Place */}
                  <View style={[styles.podiumSpot, styles.firstPlace]}>
                    <Text style={styles.podiumEmoji}>🥇</Text>
                    <Text style={styles.podiumUsername}>
                      @{leaderboard[0].username}
                    </Text>
                    <Text style={styles.podiumLikes}>
                      {leaderboard[0].todayLikes} 👍
                    </Text>
                  </View>
                  
                  {/* 3rd Place */}
                  <View style={[styles.podiumSpot, styles.thirdPlace]}>
                    <Text style={styles.podiumEmoji}>🥉</Text>
                    <Text style={styles.podiumUsername}>
                      @{leaderboard[2].username}
                    </Text>
                    <Text style={styles.podiumLikes}>
                      {leaderboard[2].todayLikes} 👍
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Full Rankings */}
            <View style={styles.rankingsContainer}>
              <Text style={styles.rankingsTitle}>Full Rankings</Text>
              {leaderboard.map((entry, index) => (
                <LeaderboardItem
                  key={entry.userId}
                  entry={entry}
                  position={index + 1}
                  isCurrentUser={entry.userId === user?.id}
                />
              ))}
            </View>
          </>
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
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
  },
  userRankContainer: {
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  userRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  leaderboardContainer: {
    paddingVertical: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  podiumContainer: {
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
  podiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  podiumSpot: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  firstPlace: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 15,
    marginBottom: 0,
  },
  secondPlace: {
    backgroundColor: '#C0C0C0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  thirdPlace: {
    backgroundColor: '#CD7F32',
    borderRadius: 12,
    padding: 15,
    marginBottom: 40,
  },
  podiumEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  podiumUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  podiumLikes: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  rankingsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    padding: 20,
    paddingBottom: 10,
  },
});

export default LeaderboardScreen;