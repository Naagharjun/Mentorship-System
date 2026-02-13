
import { Mentor } from './types';

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@tech.com',
    role: 'mentor',
    specialization: 'Artificial Intelligence & Ethics',
    avatar: 'https://picsum.photos/seed/sarah/200',
    skills: ['Python', 'PyTorch', 'Ethics in AI', 'Strategic Planning'],
    rating: 4.9,
    totalSessions: 124,
    availability: ['Mon 9-11 AM', 'Wed 2-4 PM', 'Fri 10-12 AM']
  },
  {
    id: 'm2',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@design.io',
    role: 'mentor',
    specialization: 'UX/UI & Product Management',
    avatar: 'https://picsum.photos/seed/marcus/200',
    skills: ['Figma', 'User Research', 'Product Strategy', 'Agile'],
    rating: 4.8,
    totalSessions: 89,
    availability: ['Tue 1-3 PM', 'Thu 4-6 PM']
  },
  {
    id: 'm3',
    name: 'Elena Volkov',
    email: 'elena.v@cloud.net',
    role: 'mentor',
    specialization: 'Cloud Architecture & DevOps',
    avatar: 'https://picsum.photos/seed/elena/200',
    skills: ['AWS', 'Kubernetes', 'Docker', 'Go'],
    rating: 5.0,
    totalSessions: 210,
    availability: ['Mon 4-6 PM', 'Sat 10-12 AM']
  },
  {
    id: 'm4',
    name: 'James Wilson',
    email: 'james.w@finance.com',
    role: 'mentor',
    specialization: 'FinTech & Blockchain',
    avatar: 'https://picsum.photos/seed/james/200',
    skills: ['Solidity', 'Financial Modeling', 'Venture Capital'],
    rating: 4.7,
    totalSessions: 56,
    availability: ['Wed 9-11 AM', 'Fri 2-4 PM']
  }
];

export const APP_THEME = {
  primary: 'blue-600',
  secondary: 'indigo-500',
  accent: 'teal-500',
  background: 'slate-50'
};
