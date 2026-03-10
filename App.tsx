
import React, { useState, useEffect } from 'react';
import { AuthState, User } from './types';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MentorList from './components/MentorList';
import Scheduling from './components/Scheduling';
import Requests from './components/Requests';
import MentorOnboarding from './components/MentorOnboarding';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';

import { api } from './services/api';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await api.auth.me();
        if (user) {
          setAuth({ user, isAuthenticated: true });
        }
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Heartbeat mechanism for real-time presence
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user) return; // Changed authState to auth

    // Initial heartbeat
    api.users.sendHeartbeat(auth.user.id).catch(err => console.error("Heartbeat failed", err));

    // Ping every 60 seconds
    const interval = setInterval(() => {
      api.users.sendHeartbeat(auth.user!.id).catch(err => console.error("Heartbeat failed", err));
    }, 60000);

    return () => clearInterval(interval);
  }, [auth.isAuthenticated, auth.user]);

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.auth.login(email, password);
      // Wait for the state update to ensure UI is ready? No, React handles this.
      setAuth({
        user: response.user,
        isAuthenticated: true,
      });
      setJustRegistered(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const handleGoogleLogin = async (credential: string, role: 'mentee' | 'mentor'): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.auth.googleLogin(credential, role);
      
      setAuth({
        user: response.user,
        isAuthenticated: true,
      });
      setJustRegistered(false);
      return { success: true };
    } catch (err: any) {
      console.error('Google login failed', err);
      return { success: false, message: err.message || 'Google Login Failed' };
    }
  };

  const handleRegister = async (user: User) => {
    try {
      const response = await api.auth.register(user);

      // We don't want to auto-login. The backend might have returned a token,
      // but the user wants them to go through the login flow manually.
      api.auth.logout();

      // Save email for the login screen to pre-fill
      setAuth({ user: response.user, isAuthenticated: false });
      setShowRegister(false);
      setJustRegistered(true);
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setAuth({
      user: null,
      isAuthenticated: false,
    });
    setActiveTab('dashboard');
    setShowRegister(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onToggleLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onToggleRegister={() => setShowRegister(true)}
        registrationSuccess={justRegistered}
        registeredEmail={auth.user?.email} // Not really needed on logout but keeps type happy
        registeredRole={auth.user?.role as 'mentee' | 'mentor'}
      />
    );
  }

  // Admin routing
  if (auth.user?.role === 'admin') {
    return <AdminDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Intercept mentors with truly incomplete profiles (no specialization AND no skills)
  // This avoids blocking mentors who were manually inserted in the DB with partial data
  if (auth.user?.role === 'mentor' && !auth.user?.specialization && (!auth.user?.skills || auth.user.skills.length === 0)) {
    return (
      <MentorOnboarding
        user={auth.user}
        onComplete={(updatedUser) => setAuth({ user: updatedUser, isAuthenticated: true })}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Layout
      user={auth.user}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && <Dashboard user={auth.user} />}
      {activeTab === 'mentors' && <MentorList user={auth.user} />}
      {activeTab === 'sessions' && <Scheduling user={auth.user} />}
      {activeTab === 'requests' && <Requests user={auth.user} />}
      {activeTab === 'profile' && <Profile user={auth.user} onUpdateUser={(updated) => setAuth(prev => ({ ...prev, user: updated }))} />}

    </Layout>
  );
};

export default App;
