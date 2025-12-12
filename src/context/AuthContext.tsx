import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'candidate' | 'employer' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Optional: Verify token còn valid không
          // verifyToken().catch(() => {
          //   logout();
          // });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await authService.login({ email, password, rememberMe });
  
    if (response.code === 0 && response.data) {
      const {user: userData,token} = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
    } else {
      throw new Error(response.message || 'Đăng nhập thất bại');
    }
    } catch (error:any) {
     localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      
      throw error;
      
    }
  };

 const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      
      if (response.code === 0 && response.data) {
        const { user: userData, token } = response.data;
        
        // Lưu vào state
        setUser(userData);
        
        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      // Clear any existing auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      
      // Re-throw để component xử lý
      throw error;
    }
  };


  const logout = () => {
    authService.logout();
    setUser(null);
     localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
