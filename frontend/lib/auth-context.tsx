'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserPreferences } from './types';

interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, preferences?: UserPreferences | null) => void;
  logout: () => void;
  updatePreferences: (newPrefs: UserPreferences) => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  preferences: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updatePreferences: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('gm_ai_token');
      const storedUser = localStorage.getItem('gm_ai_user');
      const storedPrefs = localStorage.getItem('gm_ai_prefs');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        }
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User, newPrefs?: UserPreferences | null) => {
    setToken(newToken);
    setUser(newUser);
    if (newPrefs) setPreferences(newPrefs);

    localStorage.setItem('gm_ai_token', newToken);
    localStorage.setItem('gm_ai_user', JSON.stringify(newUser));
    if (newPrefs) {
      localStorage.setItem('gm_ai_prefs', JSON.stringify(newPrefs));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPreferences(null);
    localStorage.removeItem('gm_ai_token');
    localStorage.removeItem('gm_ai_user');
    localStorage.removeItem('gm_ai_prefs');
  };

  const updatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('gm_ai_prefs', JSON.stringify(newPrefs));
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('gm_ai_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        token,
        isLoading,
        login,
        logout,
        updatePreferences,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
