import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',

});

axiosInstance.interceptors.request.use(async (config) => {
  const access = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');
  const decoded = jwtDecode(access);  
  if (decoded.exp < Date.now() / 1000) {
    const response = await axios.post('http://127.0.0.1:8000/user/refresh/', {
      refresh: refresh,
    });
    localStorage.setItem('access', response.data.access);
  }
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

export default axiosInstance;
