import React from 'react';
import { User } from '../types';
import MentorDashboard from './MentorDashboard';
import MenteeDashboard from './MenteeDashboard';

const Dashboard: React.FC<{ user: User | null }> = ({ user }) => {
  if (user?.role === 'mentor') {
    return <MentorDashboard user={user} />;
  }

  return <MenteeDashboard user={user} />;
};

export default Dashboard;
