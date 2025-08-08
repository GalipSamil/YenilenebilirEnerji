import axios from 'axios';

const API_URL = 'http://localhost:5283/api/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expires: string;
  user: UserInfo;
}

class AuthService {
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';
  private userKey = 'user';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const authData = response.data;
    
    this.setAuthData(authData);
    return authData;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/register`, userData);
    const authData = response.data;
    
    this.setAuthData(authData);
    return authData;
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await axios.post(`${API_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      this.clearAuthData();
      return null;
    }
  }

  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();
      
      if (!token || !refreshToken) return null;

      const response = await axios.post(`${API_URL}/refresh-token`, {
        token,
        refreshToken
      });
      
      const authData = response.data;
      this.setAuthData(authData);
      return authData;
    } catch (error) {
      console.error('Refresh token error:', error);
      this.clearAuthData();
      return null;
    }
  }

  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authData.token);
    localStorage.setItem(this.refreshTokenKey, authData.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(authData.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUser(): UserInfo | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'Admin';
  }

  // Axios interceptor for automatic token attachment
  setupAxiosInterceptors(): void {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.url?.includes('/api/')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const newAuthData = await this.refreshToken();
          if (newAuthData) {
            originalRequest.headers.Authorization = `Bearer ${newAuthData.token}`;
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService(); 