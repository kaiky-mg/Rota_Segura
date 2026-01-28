import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
console.log('API baseURL:', api.defaults.baseURL);
export default api;
console.log(import.meta.env);