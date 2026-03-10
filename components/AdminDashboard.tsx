import React, { useState, useEffect } from 'react';
import { User, Mentor, ConnectionRequest } from '../types';
import { api } from '../services/api';

const AdminDashboard: React.FC<{ user: User | null, onLogout: () => void }> = ({ user, onLogout }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    useEffect(() => {
        // Fetch all users and requests to populate admin stats and table
        Promise.all([
            api.users.getAllUsers(),
            api.requests.getAllRequests()
        ])
            .then(([usersData, requestsData]) => {
                setUsers(usersData as User[]);
                setRequests(requestsData as ConnectionRequest[]);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    const totalMentors = users.filter(u => u.role === 'mentor').length;
    const totalMentees = users.filter(u => u.role === 'mentee').length;

    // Calculate real sessions based on accepted requests
    const totalSessions = requests.filter(req => req.status === 'accepted').length;

    const handleToggleBlock = async (targetUserId: string, currentStatus: boolean | undefined) => {
        setIsActionLoading(targetUserId);
        try {
            const updatedUser = await api.users.updateProfile(targetUserId, { isBlocked: !currentStatus });
            setUsers(users.map(u => u.id === targetUserId ? updatedUser : u));
        } catch (error) {
            console.error("Failed to toggle block status", error);
            alert("Failed to update user status");
        } finally {
            setIsActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-rose-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/20">
                            🛡️
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">MentorLink Admin</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white uppercase tracking-wider">{user?.name}</p>
                                <p className="text-[10px] text-rose-400 font-medium">admin@gmail.com</p>
                            </div>
                            <img src={user?.avatar} alt="Admin" className="w-10 h-10 rounded-full border-2 border-white/10" />
                        </div>
                        <button
                            onClick={onLogout}
                            className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-white/20 active:scale-95"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">System Overview</h1>
                    <p className="text-slate-400 font-medium">Global statistics and platform health metrics.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Mentors</h3>
                                <div className="text-5xl font-black text-white tracking-tight">{totalMentors}</div>
                                <p className="text-sm text-emerald-400 font-bold mt-4">↑ 12% this week</p>
                            </div>

                            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Active Mentees</h3>
                                <div className="text-5xl font-black text-white tracking-tight">{totalMentees}</div>
                                <p className="text-sm text-emerald-400 font-bold mt-4">↑ 8% this week</p>
                            </div>

                            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sessions Booked</h3>
                                <div className="text-5xl font-black text-white tracking-tight">{totalSessions}</div>
                                <p className="text-sm text-emerald-400 font-bold mt-4">↑ 24% this week</p>
                            </div>
                        </div>

                        {/* Recent Activity Table */}
                        <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden mt-8">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xl font-black text-white tracking-tight">Registered Users</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Name</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Role</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Specialization</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6 font-bold text-white leading-tight">
                                                {u.name}
                                                <div className="text-xs font-normal text-slate-400">{u.email}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 bg-white/5 text-slate-300 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-300">{u.specialization || '-'}</td>
                                            <td className="px-8 py-6">
                                                {u.isBlocked ? (
                                                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Blocked</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Active</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                                                    disabled={isActionLoading === u.id}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${u.isBlocked
                                                        ? 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20'
                                                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20 hover:border-rose-500/30'
                                                        }`}
                                                >
                                                    {isActionLoading === u.id ? 'Updating...' : u.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
