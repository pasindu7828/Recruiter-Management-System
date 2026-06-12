import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION || '';

const API = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

export default API;
