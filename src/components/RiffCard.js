import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RiffCard = ({ riff, onVote, isOwnRiff = false }) => {
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <View style={[styles.container, isOwnRiff && styles.ownRiffContainer]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, isOwnRiff && styles.ownAvatar]}>
            <Text style={styles.avatarText}>
              {riff.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.username}>@{riff.username}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(riff.createdAt)}</Text>
          </View>
        </View>
        {isOwnRiff && (
          <View style={styles.ownBadge}>
            <Text style={styles.ownBadgeText}>You</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.content}>{riff.content}</Text>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.voteButton, 
            riff.hasVoted && styles.voteButtonActive,
            isOwnRiff && styles.voteButtonDisabled
          ]}
          onPress={isOwnRiff ? null : onVote}
          disabled={isOwnRiff}
        >
          <Text style={[
            styles.voteIcon, 
            riff.hasVoted && styles.voteIconActive,
            isOwnRiff && styles.voteIconDisabled
          ]}>
            👍
          </Text>
          <Text style={[
            styles.voteCount, 
            riff.hasVoted && styles.voteCountActive,
            isOwnRiff && styles.voteCountDisabled
          ]}>
            {riff.likes}
          </Text>
        </TouchableOpacity>
        
        {isOwnRiff && (
          <Text style={styles.ownRiffNote}>You can't vote on your own riff</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownRiffContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownAvatar: {
    backgroundColor: '#007AFF',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timeAgo: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  ownBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  voteButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  voteButtonDisabled: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E5E5EA',
    opacity: 0.6,
  },
  voteIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  voteIconActive: {
    // No change needed for active state
  },
  voteIconDisabled: {
    opacity: 0.5,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  voteCountActive: {
    color: '#007AFF',
  },
  voteCountDisabled: {
    color: '#C7C7CC',
  },
  ownRiffNote: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});

export default RiffCard;