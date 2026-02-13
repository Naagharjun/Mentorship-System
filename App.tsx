
import React, { useState } from 'react';
import { AuthState, User } from './types';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MentorList from './components/MentorList';
import Scheduling from './components/Scheduling';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  // Default guest account for testing
  const GUEST_ACCOUNT = {
    email: 'alex@example.com',
    password: 'password123',
    user: {
      id: 'u1',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      role: 'mentee' as const,
      avatar: 'https://picsum.photos/seed/alex/200',
      skills: ['JavaScript', 'React', 'CSS'],
      bio: 'Aspiring Fullstack Developer with a passion for AI.'
    }
  };

  const handleLogin = (email: string, password: string): { success: boolean; message?: string } => {
    // 1. Check against registered user
    if (registeredUser && email === registeredUser.email) {
      if (password === registeredUser.password) {
        setAuth({
          user: registeredUser,
          isAuthenticated: true,
        });
        setJustRegistered(false);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid password. Please try again.' };
      }
    }

    // 2. Check against guest account
    if (email === GUEST_ACCOUNT.email) {
      if (password === GUEST_ACCOUNT.password) {
        setAuth({
          user: GUEST_ACCOUNT.user,
          isAuthenticated: true,
        });
        setJustRegistered(false);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid password. Use "password123" for this guest account.' };
      }
    }

    return { success: false, message: 'User not found. Please register or check your email.' };
  };

  const handleRegister = (user: User) => {
    setRegisteredUser(user);
    setShowRegister(false);
    setJustRegistered(true);
  };

  const handleLogout = () => {
    setAuth({
      user: null,
      isAuthenticated: false,
    });
    setActiveTab('dashboard');
    setShowRegister(false);
  };

  if (!auth.isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegister={handleRegister} 
        onToggleLogin={() => setShowRegister(false)} 
      />
    ) : (
      <Login 
        onLogin={handleLogin} 
        onToggleRegister={() => setShowRegister(true)} 
        registrationSuccess={justRegistered}
        registeredEmail={registeredUser?.email}
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
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'mentors' && <MentorList />}
      {activeTab === 'sessions' && <Scheduling />}
      
    </Layout>
  );
};

export default App;
