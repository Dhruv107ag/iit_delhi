import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('hackathon_user', JSON.stringify(data.user));
    } catch (error) {
      const fallback = localStorage.getItem('hackathon_user');
      if (fallback) {
        setUser(JSON.parse(fallback));
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      
      // Store user strictly for header fallback
      const userPayload = {
        id: data.user?.id || data.id || 'fallback_id',
        role: data.role || 'user',
        name: username
      };
      // We do a hack here: since we don't have the full user object from login immediately,
      // we construct a mock session object if needed, but wait! The checkUser call next will fetch the real one.
      
      localStorage.setItem('hackathon_user', JSON.stringify(userPayload));
      
      await checkUser(); // Refresh user details
      return { success: true, message: data.message, role: data.role };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (storeData) => {
    try {
      const { data } = await api.post('/auth/register', storeData);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch(err) {} // ignore cookie errors
    
    localStorage.removeItem('hackathon_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};
