import { User, Mentor, ConnectionRequest } from '../types';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
    user: User;
    token: string;
}

const TOKEN_KEY = 'mentor_link_token';
// Hardcode the API base URL to our new backend for now
const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    auth: {
        login: async (email: string, password: string): Promise<AuthResponse> => {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data: AuthResponse = await res.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            return data;
        },

        register: async (userData: User): Promise<AuthResponse> => {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data: AuthResponse = await res.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            return data;
        },

        me: async (): Promise<User | null> => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return null;

            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: getHeaders()
                });

                if (!res.ok) {
                    localStorage.removeItem(TOKEN_KEY);
                    return null;
                }

                return await res.json();
            } catch (err) {
                console.error("Failed to fetch me", err);
                return null;
            }
        },

        logout: () => {
            localStorage.removeItem(TOKEN_KEY);
        },

        googleLogin: async (credential: string, role: 'mentee' | 'mentor'): Promise<AuthResponse> => {
            try {
                const decoded = jwtDecode(credential) as any;

                const res = await fetch(`${API_BASE_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        googlePayload: decoded,
                        role
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Google login failed');
                }

                const data: AuthResponse = await res.json();
                localStorage.setItem(TOKEN_KEY, data.token);
                return data;
            } catch (e) {
                console.error("Google verify err", e);
                throw new Error('Failed to parse or verify Google credential');
            }
        }
    },
    requests: {
        getAllRequests: async (): Promise<ConnectionRequest[]> => {
            const res = await fetch(`${API_BASE_URL}/requests`, {
                headers: getHeaders()
            });

            if (!res.ok) throw new Error('Failed to fetch all requests');
            return res.json();
        },
        sendRequest: async (menteeId: string, mentorId: string, menteeName: string, mentorName: string, selectedSlot: string): Promise<ConnectionRequest> => {
            const res = await fetch(`${API_BASE_URL}/requests`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ menteeId, mentorId, menteeName, mentorName, selectedSlot })
            });

            if (!res.ok) throw new Error('Failed to send request');
            return res.json();
        },
        getRequestsForUser: async (userId: string, role: string): Promise<ConnectionRequest[]> => {
            // Role is passed to filter mentor vs mentee requests
            const res = await fetch(`${API_BASE_URL}/requests/user/${userId}?role=${role}`, {
                headers: getHeaders()
            });

            if (!res.ok) throw new Error('Failed to fetch requests');
            return res.json();
        },
        updateRequestStatus: async (requestId: string, status: 'accepted' | 'rejected'): Promise<ConnectionRequest> => {
            const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error('Failed to update request');
            return res.json();
        },
        cancelRequest: async (requestId: string): Promise<void> => {
            const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: 'cancelled' }),
            });
            if (!res.ok) throw new Error('Failed to cancel request');
        }
    },
    users: {
        getAllUsers: async (): Promise<User[]> => {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: getHeaders()
            });

            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        getMentors: async (): Promise<User[]> => {
            const res = await fetch(`${API_BASE_URL}/users/mentors`, {
                headers: getHeaders()
            });

            if (!res.ok) throw new Error('Failed to fetch mentors');
            return res.json();
        },
        updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
            const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });

            if (!res.ok) throw new Error('Failed to update profile');
            return res.json();
        },
        sendHeartbeat: async (id: string) => {
            const res = await fetch(`${API_BASE_URL}/users/${id}/heartbeat`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to send heartbeat');
            return res.json();
        }
    }
};
