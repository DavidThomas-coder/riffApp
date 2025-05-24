import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRiff } from '../contexts/RiffContext';

const CreateRiffScreen = ({ navigation }) => {
  const { dailyPrompt, createRiff, getUserRiffs } = useRiff();
  const [riffText, setRiffText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userRiffs = getUserRiffs();
  const hasSubmittedToday = userRiffs.length > 0;

  const handleSubmit = async () => {
    if (riffText.trim().length < 10) {
      Alert.alert('Too Short', 'Your riff needs to be at least 10 characters long');
      return;
    }

    if (riffText.trim().length > 500) {
      Alert.alert('Too Long', 'Your riff cannot exceed 500 characters');
      return;
    }

    setSubmitting(true);
    const result = await createRiff(riffText.trim());
    
    if (result.success) {
      Alert.alert('Success!', 'Your riff has been submitted', [
        { text: 'OK', onPress: () => {
          setRiffText('');
          navigation.navigate('Home');
        }}
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to submit riff');
    }
    
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Riff</Text>
          {hasSubmittedToday && (
            <Text style={styles.submittedNotice}>
              You've already submitted a riff today! You can create another one.
            </Text>
          )}
        </View>

        {dailyPrompt && (
          <View style={styles.promptContainer}>
            <Text style={styles.promptLabel}>Today's Prompt:</Text>
            <Text style={styles.promptText}>{dailyPrompt.text}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Riff:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your creative take on today's prompt..."
            placeholderTextColor="#8E8E93"
            value={riffText}
            onChangeText={setRiffText}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <View style={styles.charCount}>
            <Text style={[
              styles.charCountText,
              riffText.length > 450 && styles.charCountWarning
            ]}>
              {riffText.length}/500
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!riffText.trim() || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!riffText.trim() || submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Riff'}
          </Text>
        </TouchableOpacity>

        {hasSubmittedToday && (
          <View style={styles.todaysRiffsContainer}>
            <Text style={styles.todaysRiffsTitle}>Your Riffs Today:</Text>
            {userRiffs.map((riff, index) => (
              <View key={riff.id} style={styles.userRiffCard}>
                <Text style={styles.userRiffContent}>{riff.content}</Text>
                <Text style={styles.userRiffStats}>👍 {riff.likes} likes</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContainer: {
    flexGrow: 1,
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
  submittedNotice: {
    fontSize: 14,
    color: '#FF9500',
    fontStyle: 'italic',
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
  inputContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    margin: 20,
    marginBottom: 0,
  },
  textInput: {
    padding: 20,
    fontSize: 16,
    minHeight: 120,
    color: '#000',
  },
  charCount: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: 'flex-end',
  },
  charCountText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  charCountWarning: {
    color: '#FF3B30',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  todaysRiffsContainer: {
    margin: 15,
    marginTop: 30,
  },
  todaysRiffsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  userRiffCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  userRiffContent: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  userRiffStats: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default CreateRiffScreen;