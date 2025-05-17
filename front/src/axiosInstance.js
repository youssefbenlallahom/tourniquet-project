import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

axiosInstance.interceptors.request.use(async (config) => {
  const access = localStorage.getItem('access');
  
  if (access) {
    try {
      const decoded = jwtDecode(access);  
      if (decoded.exp < Date.now() / 1000) {
        const refresh = localStorage.getItem('refresh');
        if (refresh) {
          try {
            const response = await axios.post('http://127.0.0.1:8000/user/refresh/', {
              refresh: refresh,
            });
            if (response.data.access) {
              localStorage.setItem('access', response.data.access);
              config.headers.Authorization = `Bearer ${response.data.access}`;
            } else {
              // If refresh fails, clear storage
              localStorage.removeItem('access');
              localStorage.removeItem('refresh');
              localStorage.setItem('isAuthenticated', JSON.stringify(false));
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.setItem('isAuthenticated', JSON.stringify(false));
          }
        }
      } else {
        config.headers.Authorization = `Bearer ${access}`;
      }
    } catch (error) {
      console.error('Invalid token format:', error);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.setItem('isAuthenticated', JSON.stringify(false));
    }
  }
  
  return config;
});

export default axiosInstance;
