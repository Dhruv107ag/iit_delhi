import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to your backend port 5000
  withCredentials: true // Extremely important for express-session
});

export default api;
