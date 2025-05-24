import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ resetTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const reset = new Date(resetTime);
      const difference = reset - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('00:00:00');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [resetTime]);

  const getTimeColor = () => {
    const now = new Date();
    const reset = new Date(resetTime);
    const difference = reset - now;
    const hoursLeft = difference / (1000 * 60 * 60);
    
    if (hoursLeft < 1) return '#FF3B30'; // Red for urgent
    if (hoursLeft < 3) return '#FF9500'; // Orange for warning
    return '#34C759'; // Green for plenty of time
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Next prompt in:</Text>
      <Text style={[styles.timer, { color: getTimeColor() }]}>
        {timeLeft}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 5,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

export default CountdownTimer;