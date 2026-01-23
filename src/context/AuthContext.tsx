import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api/authApi';

type UserRole = 'admin' | 'donor' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_DATA_KEY = '@bdms_user_data';
const AUTH_TOKEN_KEY = '@bdms_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
    } catch {
      await AsyncStorage.multiRemove([USER_DATA_KEY, AUTH_TOKEN_KEY]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'local_session_' + userData.id);
  };

  const clearUserFromStorage = async () => {
    await AsyncStorage.multiRemove([USER_DATA_KEY, AUTH_TOKEN_KEY]);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    const response = await authApi.register({
      name,
      email,
      password,
      role,
    });

    if (!response.success) {
      throw new Error('Registration failed');
    }

    const userData: User = response.user;
    setUser(userData);
    await saveUserToStorage(userData);
  };

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ) => {
    const response = await authApi.login({ email, password, role });

    if (!response.success) {
      throw new Error('Invalid credentials');
    }

    const userData: User = response.user;
    setUser(userData);
    await saveUserToStorage(userData);
  };

  const logout = async () => {
    setUser(null);
    await clearUserFromStorage();
  };

  const resetPassword = async (email: string, newPassword: string) => {
    const response = await authApi.resetPassword(email, newPassword);
    if (!response.success) {
      throw new Error('Password reset failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
