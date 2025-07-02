import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
      }
      setLoading(false);
    };
    
    checkStoredUser();
  }, []);

  const login = async (email, password) => {
    try {
      // For now, implement simple local authentication
      // TODO: Re-enable Firebase Auth once the registration issue is resolved
      
      // Simulate authentication
      const userInfo = {
        id: 'local-user-' + Date.now(),
        email: email,
        username: email.split('@')[0],
        totalMedals: { gold: 0, silver: 0, bronze: 0 },
        createdAt: new Date().toISOString(),
      };
      
      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed: ' + error.message };
    }
  };

  const register = async (email, password, username) => {
    try {
      // For now, implement simple local registration
      // TODO: Re-enable Firebase Auth once the registration issue is resolved
      
      // Simulate user creation
      const userInfo = {
        id: 'local-user-' + Date.now(),
        email: email,
        username: username,
        totalMedals: { gold: 0, silver: 0, bronze: 0 },
        createdAt: new Date().toISOString(),
      };
      
      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed: ' + error.message };
    }
  };

  const logout = async () => {
    try {
      // Remove stored user data
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};