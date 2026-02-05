import axios from 'axios';
import { setupAuthInterceptors } from './interceptors/authInterceptor';
import { setupErrorInterceptor } from './interceptors/errorInterceptor';

export const apiClient = axios.create({
  baseURL: 'https://pet-manager-api.geia.vip',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupAuthInterceptors(apiClient);

setupErrorInterceptor(apiClient);

export default apiClient;

