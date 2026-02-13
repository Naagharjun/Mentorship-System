
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'mentee' | 'admin';
  avatar: string;
  skills?: string[];
  bio?: string;
  password?: string; // Added for mock login validation
}

export interface Mentor extends User {
  specialization: string;
  availability: string[];
  rating: number;
  totalSessions: number;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  topic: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
