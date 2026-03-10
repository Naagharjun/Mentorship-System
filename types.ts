
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'mentee' | 'admin';
  avatar: string;
  skills?: string[];
  bio?: string;
  password?: string; // Added for mock login validation
  specialization?: string; // Move to User so Partial<User> works easily
  availability?: string[];
  sessionSlots?: { date: string, time: string, available: number }[];
  lastActive?: string;
  isBlocked?: boolean;
}

// Keeping Mentor distinct but extending is fine since standard User allows optionals now
export interface Mentor extends User {
  totalSessions?: number;
  sessionSlots?: { date: string, time: string, available: number }[];
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

export interface ConnectionRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  timestamp: number;
  menteeName: string;
  mentorName: string;
  selectedSlot?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
