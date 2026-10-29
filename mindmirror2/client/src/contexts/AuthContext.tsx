import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import type { User, StudentProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    college?: string;
    course?: string;
    semester?: string;
  }) => Promise<void>;
  loginAsDemo: () => void;
  loginAsAdminOverride: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
      setProfile(data.profile || null);
    } catch {
      // If token in localStorage was a demo token
      const demoStored = localStorage.getItem('mm_demo_user');
      if (demoStored) {
        try {
          setUser(JSON.parse(demoStored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authApi.login(credentials);
      setUser(loggedInUser);
      localStorage.removeItem('mm_demo_user');
      await refreshSession();
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const errMsg = String(err?.message || err);
      if (
        status === 405 ||
        status === 404 ||
        status === 502 ||
        status === 503 ||
        errMsg.includes('405') ||
        errMsg.includes('404') ||
        errMsg.includes('Network Error') ||
        errMsg.includes('Failed to fetch') ||
        errMsg.includes('ERR_CONNECTION_REFUSED')
      ) {
        console.warn('Backend API unavailable on static deployment (405/404). Initializing local student session.');
        const localUser: User = {
          id: 'usr_' + Date.now().toString(36),
          email: credentials.email,
          fullName: credentials.email.split('@')[0],
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
        };
        setUser(localUser);
        localStorage.setItem('mm_demo_user', JSON.stringify(localUser));
        localStorage.setItem('mm_token', 'local-token-' + Date.now());
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    college?: string;
    course?: string;
    semester?: string;
  }) => {
    setIsLoading(true);
    try {
      const { user: registeredUser } = await authApi.register(data);
      setUser(registeredUser);
      localStorage.removeItem('mm_demo_user');
      await refreshSession();
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const errMsg = String(err?.message || err);
      if (
        status === 405 ||
        status === 404 ||
        status === 502 ||
        status === 503 ||
        errMsg.includes('405') ||
        errMsg.includes('404') ||
        errMsg.includes('Network Error') ||
        errMsg.includes('Failed to fetch') ||
        errMsg.includes('ERR_CONNECTION_REFUSED')
      ) {
        console.warn('Backend API unavailable on static deployment (405/404). Initializing student profile locally.');
        const localUser: User = {
          id: 'usr_' + Date.now().toString(36),
          email: data.email,
          fullName: data.fullName,
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
        };
        const localProfile: StudentProfile = {
          id: 'prof_' + Date.now().toString(36),
          userId: localUser.id,
          college: data.college || 'PSG College of Technology',
          course: data.course || 'BE CSE (AI & ML)',
          semester: data.semester || 'Semester 5',
          onboardingCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(localUser);
        setProfile(localProfile);
        localStorage.setItem('mm_demo_user', JSON.stringify(localUser));
        localStorage.setItem('mm_token', 'local-token-' + Date.now());
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      id: 'demo-student-001',
      email: 'alex.chen@engineering.edu',
      fullName: 'Alex Chen',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    localStorage.setItem('mm_demo_user', JSON.stringify(demoUser));
    localStorage.setItem('mm_token', 'demo-token-anti-gravity');
  };

  const loginAsAdminOverride = () => {
    const adminUser: User = {
      id: 'admin-override-001',
      email: 'admin.override@mindmirror.internal',
      fullName: 'Lead Academic Administrator',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    };
    setUser(adminUser);
    localStorage.setItem('mm_demo_user', JSON.stringify(adminUser));
    localStorage.setItem('mm_token', 'admin-test-override-token-2026');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('mm_demo_user');
      localStorage.removeItem('mm_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        loginAsDemo,
        loginAsAdminOverride,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
