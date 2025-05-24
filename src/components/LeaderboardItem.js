import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LeaderboardItem = ({ entry, position, isCurrentUser = false }) => {
  const getMedalEmoji = (medal) => {
    switch (medal) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return null;
    }
  };

  const getRankColor = (pos) => {
    if (pos === 1) return '#FFD700';
    if (pos === 2) return '#C0C0C0';
    if (pos === 3) return '#CD7F32';
    return '#F2F2F7';
  };

  return (
    <View style={[
      styles.container, 
      position <= 3 && styles.topThree,
      isCurrentUser && styles.currentUser
    ]}>
      <View style={styles.leftSection}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(position) }]}>
          <Text style={[
            styles.position,
            position <= 3 && styles.topPosition
          ]}>
            #{position}
          </Text>
        </View>
        {entry.medal && (
          <Text style={styles.medal}>{getMedalEmoji(entry.medal)}</Text>
        )}
      </View>
      
      <View style={styles.middleSection}>
        <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
          @{entry.username}
        </Text>
        {isCurrentUser && (
          <Text style={styles.youBadge}>You</Text>
        )}
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.likes, position <= 3 && styles.topLikes]}>
          {entry.todayLikes} 👍
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  topThree: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderBottomColor: '#E5E5EA',
  },
  currentUser: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  rankBadge: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  position: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  topPosition: {
    color: '#000',
  },
  medal: {
    fontSize: 20,
  },
  middleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  currentUserText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  youBadge: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  likes: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  topLikes: {
    color: '#007AFF',
    fontSize: 18,
  },
});

export default LeaderboardItem;