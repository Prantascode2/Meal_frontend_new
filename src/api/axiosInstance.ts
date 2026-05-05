import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/** REQUEST INTERCEPTOR */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** RESPONSE INTERCEPTOR */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Handle 401 Unauthorized (Expired Access Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Use a clean axios instance to avoid infinite loops
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
            refreshToken: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Re-attach the new token and retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest); 
        } catch (refreshError) {
          console.error("Refresh token failed, logging out...");
          handleLogout();
        }
      } else {
        handleLogout();
      }
    }

    // 2. Handle 403 Forbidden (Missing Permissions)
    if (error.response?.status === 403) {
      console.error("403 Forbidden: Your token is valid but you don't have permission for this resource.");
      // Optional: Redirect to a 'forbidden' page or show a toast notification
    }

    return Promise.reject(error);
  }
);

const handleLogout = () => {
  const role = localStorage.getItem('role');
  localStorage.clear();
  
  // Redirect based on role
  if (role === 'ADMIN') {
    window.location.href = '/login';
  } else {
    window.location.href = '/member/login';
  }
};

export default api;