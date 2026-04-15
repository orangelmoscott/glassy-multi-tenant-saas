import axios from 'axios';

// Glassy SaaS Global API URL (Production)
const API_URL = 'https://glassy.es/api';

const api = axios.create({
  baseURL: API_URL
});

export default api;
