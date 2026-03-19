import axios from 'axios';

// Glassy SaaS Global API URL (Production)
const API_URL = 'https://glassy-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL
});

export default api;
