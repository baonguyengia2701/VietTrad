import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user from localStorage on app load
    const user = userService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Login function that updates context
  const login = async (email, password) => {
    const user = await userService.login(email, password);
    setCurrentUser(user);
    return user;
  };

  // Register function that updates context
  const register = async (name, email, password) => {
    const user = await userService.register(name, email, password);
    setCurrentUser(user);
    return user;
  };

  // Logout function that updates context
  const logout = () => {
    userService.logout();
    setCurrentUser(null);
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    const updatedUser = await userService.updateUserProfile(userData);
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
    return updatedUser;
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateUserProfile,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext; 