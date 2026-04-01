import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const userData = localStorage.getItem('hackathon_user');
  if (userData) {
    config.headers['x-user-data'] = userData;
  }
  return config;
});

export default api;
