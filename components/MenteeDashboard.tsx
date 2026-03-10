import React, { useState, useEffect } from 'react';
import { User, Mentor, ConnectionRequest } from '../types';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';

/**
 * A mentor is considered "online" if their last heartbeat was within the last 5 minutes.
 */
const isMentorOnline = (mentor: Mentor): boolean => {
    if (!mentor.lastActive) return false;
    const lastActiveDate = new Date(mentor.lastActive);
    if (isNaN(lastActiveDate.getTime())) return false;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isOnline = lastActiveDate > fiveMinutesAgo;

    // DEBUG: Remove later
    console.log(`[Presence Debug] Mentor: ${mentor.name} | lastActive: ${mentor.lastActive} | lastActiveDate: ${lastActiveDate} | fiveMinutesAgo: ${fiveMinutesAgo} | IS_ONLINE: ${isOnline}`);

    return isOnline;
};

const MenteeDashboard: React.FC<{ user: User | null }> = ({ user }) => {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [selectedMentorId, setSelectedMentorId] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [mentorsData, requestsData] = await Promise.all([
                    api.users.getMentors(),
                    api.requests.getRequestsForUser(user.id, user.role)
                ]);
                setMentors(mentorsData as Mentor[]);
                setRequests(requestsData);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };

        // Initial fetch
        fetchData();

        // Placed in interval to refresh statuses live
        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    const handleQuickBook = async () => {
        if (!user || !selectedMentorId) return;
        setIsRequesting(true);
        setRequestSuccess('');

        try {
            const mentor = mentors.find(m => m.id === selectedMentorId);
            if (mentor) {
                // For quick book, we'll try to pick their first slot or default to 'Flexible'
                const slotToRequest = mentor.availability && mentor.availability.length > 0 ? mentor.availability[0] : 'Flexible';
                await api.requests.sendRequest(user.id, mentor.id, user.name, mentor.name, slotToRequest);
                setRequestSuccess(`Request sent to ${mentor.name} for ${slotToRequest}! Check your Requests tab.`);
                setTimeout(() => setRequestSuccess(''), 5000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRequesting(false);
        }
    };

    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const handleCancel = async (requestId: string) => {
        setCancellingId(requestId);
        try {
            await api.requests.cancelRequest(requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Failed to cancel session', err);
        } finally {
            setCancellingId(null);
        }
    };

    const acceptedRequests = requests.filter(r => r.status === 'accepted');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Upcoming Sessions</p>
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📅</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{acceptedRequests.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed Hours</p>
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">⭐</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{acceptedRequests.length * 1.5}</h3>
                        <span className="text-[10px] font-black px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">Top 5%</span>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Skill Proficiency</p>
                        <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">👥</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{Math.min(100, Math.round(40 + (acceptedRequests.length * 1.5) * 2))}%</h3>
                        <span className="text-[10px] font-black px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">Growing Fast</span>
                    </div>
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Sessions List */}
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Schedule</h3>
                    </div>

                    <div className="space-y-5">
                        {acceptedRequests.length === 0 ? (
                            <p className="text-sm text-slate-400 font-medium py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">No upcoming sessions. Book a mentor to get started.</p>
                        ) : (
                            acceptedRequests.slice(0, 3).map((r) => {
                                const d = new Date(r.timestamp);
                                return (
                                    <div key={r.id} className="group flex gap-5 p-5 rounded-3xl hover:bg-white transition-all border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/30">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                            <span className="text-[10px] font-black leading-none uppercase mb-1 opacity-70">
                                                {d.toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-2xl font-black leading-none">
                                                {d.getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="text-base font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">Mentorship Session</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1 mb-3 uppercase tracking-wider">with {r.mentorName} • {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                            <div className="flex gap-3">
                                                <button className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all uppercase tracking-[0.1em] shadow-lg shadow-blue-500/20 active:scale-95">
                                                    Join Live
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(r.id)}
                                                    disabled={cancellingId === r.id}
                                                    className="px-5 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all uppercase tracking-[0.1em] active:scale-95 disabled:opacity-50"
                                                >
                                                    {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <button className="w-full mt-8 py-4 text-xs font-black text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 uppercase tracking-[0.2em]">
                        View Historical Data
                    </button>
                </div>

                {/* Career Progress Mini-View */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                    <div className="relative">
                        <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Recent Achievements</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 group cursor-default">
                                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-2xl border border-amber-500/30 group-hover:scale-110 transition-transform">🏆</div>
                                <div>
                                    <p className="text-base font-black text-white tracking-tight">5-Session Streak</p>
                                    <p className="text-sm text-indigo-200/60 font-medium">You've completed 5 sessions this month!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 group cursor-default">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-2xl border border-purple-500/30 group-hover:scale-110 transition-transform">🎯</div>
                                <div>
                                    <p className="text-base font-black text-white tracking-tight">Goal Reached</p>
                                    <p className="text-sm text-indigo-200/60 font-medium">Mastered React Fundamentals.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 group cursor-default">
                                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/30 group-hover:scale-110 transition-transform">🤝</div>
                                <div>
                                    <p className="text-base font-black text-white tracking-tight">First Endorsement</p>
                                    <p className="text-sm text-indigo-200/60 font-medium">Endorsed by Elena Volkov.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden">
                        <h4 className="text-sm font-black text-white mb-3 tracking-tight">Quick Connect</h4>
                        <div className="flex flex-col gap-3">
                            <select
                                value={selectedMentorId}
                                onChange={(e) => setSelectedMentorId(e.target.value)}
                                className="w-full bg-slate-900/50 text-white text-sm rounded-xl px-4 py-3 border border-indigo-500/30 focus:outline-none focus:border-indigo-400"
                            >
                                <option value="">Select a Mentor...</option>
                                {mentors.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {isMentorOnline(m) ? '🟢' : '⚫'} {m.name} — {m.specialization || 'Mentor'}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleQuickBook}
                                disabled={!selectedMentorId || isRequesting}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                            >
                                {isRequesting ? 'Sending...' : 'Request Connection'}
                            </button>
                            {requestSuccess && (
                                <p className="text-emerald-400 text-xs font-medium text-center mt-1 animate-in fade-in">{requestSuccess}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-full group-hover:opacity-10 transition-all duration-500"></div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 relative">Expert Insight</p>
                        <p className="text-sm text-indigo-50/90 italic leading-relaxed relative font-medium">
                            "To maximize Dr. Chen's expertise, prepare specific architecture diagrams for review."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteeDashboard;
