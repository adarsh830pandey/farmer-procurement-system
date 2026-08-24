import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'farmer' | 'admin' | null
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('kisan_auth_token');
    const savedUser = localStorage.getItem('kisan_user');
    const savedRole = localStorage.getItem('kisan_role');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setRole(savedRole || 'farmer');
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('kisan_auth_token');
        localStorage.removeItem('kisan_user');
        localStorage.removeItem('kisan_role');
      }
    }
    setLoading(false);
  }, []);

  const loginFarmer = async (credentials) => {
    const data = await authService.loginFarmer(credentials);
    const loggedUser = data.user || data.farmer || { name: 'Kisan', mobile: credentials.mobile };
    setUser(loggedUser);
    setRole('farmer');
    setToken(data.token || 'demo-token');
    return data;
  };

  const loginAdmin = async (credentials) => {
    const data = await authService.loginAdmin(credentials);
    const loggedAdmin = data.user || data.admin || { name: 'Centre Officer', email: credentials.email || credentials.username };
    setUser(loggedAdmin);
    setRole('admin');
    setToken(data.token || 'demo-admin-token');
    return data;
  };

  const registerFarmer = async (userData) => {
    const data = await authService.registerFarmer(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('kisan_user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token,
        isFarmer: role === 'farmer',
        isAdmin: role === 'admin',
        loading,
        loginFarmer,
        loginAdmin,
        registerFarmer,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
