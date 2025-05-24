import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MedalDisplay = ({ medals }) => {
  const totalMedals = medals.gold + medals.silver + medals.bronze;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medal Collection</Text>
      <Text style={styles.totalText}>Total: {totalMedals} medals</Text>
      
      <View style={styles.medalsRow}>
        <View style={styles.medalItem}>
          <View style={[styles.medalCircle, styles.goldCircle]}>
            <Text style={styles.medalEmoji}>🥇</Text>
          </View>
          <Text style={styles.medalCount}>{medals.gold}</Text>
          <Text style={styles.medalLabel}>Gold</Text>
        </View>
        
        <View style={styles.medalItem}>
          <View style={[styles.medalCircle, styles.silverCircle]}>
            <Text style={styles.medalEmoji}>🥈</Text>
          </View>
          <Text style={styles.medalCount}>{medals.silver}</Text>
          <Text style={styles.medalLabel}>Silver</Text>
        </View>
        
        <View style={styles.medalItem}>
          <View style={[styles.medalCircle, styles.bronzeCircle]}>
            <Text style={styles.medalEmoji}>🥉</Text>
          </View>
          <Text style={styles.medalCount}>{medals.bronze}</Text>
          <Text style={styles.medalLabel}>Bronze</Text>
        </View>
      </View>

      {totalMedals === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No medals yet!</Text>
          <Text style={styles.emptySubtext}>
            Finish in the top 3 daily rankings to earn medals
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  medalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  medalItem: {
    alignItems: 'center',
    flex: 1,
  },
  medalCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  goldCircle: {
    backgroundColor: '#FFD700',
  },
  silverCircle: {
    backgroundColor: '#C0C0C0',
  },
  bronzeCircle: {
    backgroundColor: '#CD7F32',
  },
  medalEmoji: {
    fontSize: 24,
  },
  medalCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  medalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MedalDisplay;