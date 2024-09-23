import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirection

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      const navigate = useNavigate();
      navigate('/login'); 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
