import React, { useState, useEffect } from 'react';
import { User, ConnectionRequest, Review, Resource } from '../types';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';

const AdminDashboard: React.FC<{ 
    user: User | null, 
    onLogout: () => void, 
    activeTab: 'overview' | 'activity' | 'users', 
    onTabChange: (tab: string) => void 
}> = ({ user, onLogout, activeTab, onTabChange }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [dbStatus, setDbStatus] = useState<{ connected: boolean, state: number, counts: any, dbName: string, timestamp: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [userTypeTab, setUserTypeTab] = useState<'mentor' | 'mentee'>('mentor');
    const [isAdminVerified, setIsAdminVerified] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [passcodeError, setPasscodeError] = useState(false);

    useEffect(() => {
        if (isAdminVerified) {
            const timer = setTimeout(() => {
                setIsAdminVerified(false);
                setPasscode('');
            }, 30000); // 30 second lock
            return () => clearTimeout(timer);
        }
    }, [isAdminVerified]);

    const fetchData = async () => {
        try {
            const [usersData, requestsData, reviewsData, resourcesData, statusData] = await Promise.all([
                api.users.getAllUsers(),
                api.requests.getAllRequests(),
                api.reviews.getAllReviews(),
                api.resources.getResources(),
                api.admin.getStatus()
            ]);
            setUsers(usersData as User[]);
            setRequests(requestsData as ConnectionRequest[]);
            setReviews(reviewsData as Review[]);
            setResources(resourcesData as Resource[]);
            setDbStatus(statusData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(async () => {
            try {
                const status = await api.admin.getStatus();
                setDbStatus(status);
            } catch (e) {
                setDbStatus(prev => prev ? { ...prev, connected: false } : null);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const totalMentors = users.filter(u => u.role === 'mentor').length;
    const totalMentees = users.filter(u => u.role === 'mentee').length;
    const totalSessions = requests.filter(req => req.status === 'accepted').length;

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === '310106') {
            setIsAdminVerified(true);
            setPasscodeError(false);
        } else {
            setPasscodeError(true);
            setPasscode('');
        }
    };

    if (!isAdminVerified) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-20 w-full animate-scanline"></div>
                </div>
                
                <div className="w-full max-w-lg admin-card-glass p-12 rounded-[4rem] border border-white/10 relative z-10 animate-in fade-in zoom-in duration-700 backdrop-blur-3xl">
                    <div className="text-center mb-12">
                        <div className="relative inline-block mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-3xl flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                                <span className="animate-pulse">🛡️</span>
                            </div>
                            <div className="absolute -inset-2 bg-indigo-500/20 rounded-[2rem] blur-xl opacity-50 animate-pulse"></div>
                        </div>
                        
                        <h2 className="text-4xl font-black text-white tracking-tight mb-3">
                            Executive <span className="text-gradient-admin">Portal</span>
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                             <div className="h-px w-8 bg-white/20"></div>
                             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] opacity-80">Identity Verification Required</p>
                             <div className="h-px w-8 bg-white/20"></div>
                        </div>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-8">
                        <div className="relative group">
                            <input
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="ACCESS CODE"
                                className={`w-full bg-white/5 border ${passcodeError ? 'border-rose-500 animate-shake' : 'border-white/10 shadow-inner'} rounded-[2rem] px-8 py-6 text-white text-center text-2xl font-black tracking-[0.8em] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 placeholder:tracking-widest placeholder:text-xs uppercase`}
                                autoFocus
                            />
                            {passcodeError && (
                                <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-center gap-2 text-rose-500 animate-in slide-in-from-top-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Unauthorized Access Attempted</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 mt-8">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/20 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Initialize Session
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[9px] transition-all border border-white/5"
                            >
                                Terminate / Logout
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center opacity-40">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Node Status</span>
                            <span className="text-[9px] font-bold text-indigo-400">Verifying...</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
                            <span className="text-[9px] font-bold text-indigo-400">AES-256-GCM</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const allActivities = [
        ...requests.map(req => ({
            type: 'request' as const,
            id: req.id,
            userId: req.menteeId,
            date: new Date(req.timestamp),
            title: 'Connection Request',
            content: `${req.menteeName} requested to connect with ${req.mentorName}`,
            status: req.status,
            meta: req.selectedSlot
        })),
        ...reviews.map(rev => ({
            type: 'review' as const,
            id: rev.id,
            userId: rev.menteeId,
            date: new Date(rev.createdAt),
            title: 'New Review',
            content: `${rev.menteeName} left a ${rev.rating}★ review for a mentor`,
            status: 'neutral',
            meta: rev.comment
        })),
        ...resources.map(res => ({
            type: 'resource' as const,
            id: res.id,
            userId: res.mentorId,
            date: new Date(res.createdAt),
            title: 'Resource Shared',
            content: `A new ${res.type} was shared: ${res.title}`,
            status: 'neutral',
            meta: res.description
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const handleToggleBlock = async (targetUserId: string) => {
        setIsActionLoading(targetUserId);
        try {
            const result = await api.admin.toggleBlockUser(targetUserId);
            setUsers(users.map(u => u.id === targetUserId ? { ...u, isBlocked: result.isBlocked } : u));
        } catch (error) {
            console.error("Failed to toggle block status", error);
            alert("Failed to update user status");
        } finally {
            setIsActionLoading(null);
        }
    };

    const renderBlockButton = (userId: string, compact = false) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser || targetUser.role === 'admin') return null;

        const isBlocked = targetUser.isBlocked;
        return (
            <button
                onClick={() => handleToggleBlock(userId)}
                disabled={isActionLoading === userId}
                className={`transition-all font-black uppercase tracking-widest disabled:opacity-50 ${
                    compact 
                    ? `text-[9px] px-2 py-1 rounded-md border ${isBlocked ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`
                    : `text-[10px] px-6 py-2.5 rounded-2xl border ${isBlocked ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white/5 hover:bg-rose-500 hover:text-white text-slate-400 border-white/10 hover:border-rose-500'}`
                }`}
            >
                {isActionLoading === userId ? '...' : isBlocked ? 'Unblock' : 'Block'}
            </button>
        );
    };

    return (
        <div className="text-slate-200 font-sans selection:bg-indigo-500/30">
            <div className="py-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-6">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-indigo-500/20 border-t-indigo-500"></div>
                            <div className="absolute inset-0 animate-pulse bg-indigo-500/20 blur-xl rounded-full"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse mb-1">Synchronizing Core</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fetching Platform State...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {activeTab === 'overview' && (
                            <section className="space-y-12">
                                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-[0.2em]">Platform Executive</span>
                                            <div className="h-1 w-1 bg-slate-700 rounded-full"></div>
                                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">v2.4.0-Stable</span>
                                        </div>
                                        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
                                            Control <span className="text-gradient-admin">Center</span>
                                        </h1>
                                        <p className="text-slate-400 font-medium text-lg max-w-xl">
                                            Connected to <span className="text-indigo-400 font-bold">`{dbStatus?.dbName || 'Production-DB'}`</span>. 
                                            Snapshot latency: <span className="text-rose-400 font-mono font-bold">14ms</span>.
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        <div className={`px-6 py-3 admin-card-glass rounded-2xl flex items-center gap-4 border ${dbStatus?.connected ? 'border-emerald-500/20' : 'border-rose-500/20'} transition-all hover:bg-white/[0.05]`}>
                                            <div className="relative">
                                                <div className={`w-3 h-3 rounded-full ${dbStatus?.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                {dbStatus?.connected && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${dbStatus?.connected ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {dbStatus?.connected ? 'Cluster Nominal' : 'Node Offline'}
                                                </span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Last Check: {dbStatus?.timestamp ? new Date(dbStatus.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Mentors', value: totalMentors, color: 'indigo', icon: '👨‍🏫', trend: '+4.2%' },
                                        { label: 'Total Mentees', value: totalMentees, color: 'rose', icon: '👨‍🎓', trend: '+12.1%' },
                                        { label: 'Active Sessions', value: totalSessions, color: 'emerald', icon: '🤝', trend: 'Live' },
                                        { label: 'Resource Assets', value: resources.length, color: 'amber', icon: '📦', trend: 'Audit OK' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="admin-card-glass p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                                            <div className={`absolute -top-12 -right-12 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-3xl transition-transform group-hover:scale-150`}></div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-2xl border border-${stat.color}-500/20`}>{stat.icon}</div>
                                                <span className={`text-[10px] font-black ${stat.trend === 'Live' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 bg-white/5'} px-3 py-1 rounded-full uppercase tracking-widest`}>{stat.trend}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                                                <div className="text-5xl font-black text-white tracking-tighter">{stat.value}</div>
                                            </div>
                                            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full bg-${stat.color}-500 w-2/3 rounded-full opacity-50`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 admin-card-glass border border-white/10 rounded-[3.5rem] p-10 overflow-hidden relative">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <h3 className="text-2xl font-black text-white tracking-tight">Platform Event Stream</h3>
                                                <p className="text-slate-500 text-sm font-medium mt-1">Real-time ingestion from all active nodes.</p>
                                            </div>
                                            <button onClick={() => onTabChange('activity')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest transition-all border border-white/5">View Full Log</button>
                                        </div>
                                        
                                        <div className="space-y-5">
                                            {allActivities.slice(0, 6).map((act, i) => (
                                                <div key={act.id + i} className="group flex items-center gap-6 p-4 rounded-[2rem] hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105 ${
                                                        act.type === 'request' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' :
                                                        act.type === 'review' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]' :
                                                        'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                                    }`}>
                                                        <span className="text-2xl">{act.type === 'request' ? '🤝' : act.type === 'review' ? '⭐' : '📦'}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-black text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{act.title}</p>
                                                            <span className="text-[10px] font-bold text-slate-600 font-mono whitespace-nowrap">{act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium truncate italic">"{act.content}"</p>
                                                    </div>
                                                    <div className="hidden sm:block">
                                                        {renderBlockButton(act.userId, true)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="admin-card-glass border border-emerald-500/20 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-4xl mb-6 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 group-hover:rotate-12 transition-transform">📈</div>
                                            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Growth Target</h3>
                                            <p className="text-slate-400 text-sm max-w-[200px] font-medium italic">85% of monthly active user quota achieved.</p>
                                            <div className="w-full h-3 bg-white/5 rounded-full mt-10 overflow-hidden p-0.5 border border-white/5">
                                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"></div>
                                            </div>
                                            <div className="mt-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Scale: Phase 4</div>
                                        </div>

                                        <div className="admin-card-glass border border-white/5 rounded-[3rem] p-10 relative group overflow-hidden">
                                            <div className="flex flex-col gap-6">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Quick Protocols</h4>
                                                    <div className="space-y-3">
                                                        {['Primary Backup', 'Cache Flush', 'Re-index Docs'].map((label, i) => (
                                                            <button key={i} className="w-full py-4 px-6 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-2xl text-[10px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-widest transition-all text-left flex justify-between items-center group-button">
                                                                {label}
                                                                <span className="w-2 h-2 rounded-full bg-slate-700 group-button-hover:bg-indigo-500 transition-colors"></span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'activity' && (
                            <section className="space-y-12 max-w-5xl mx-auto">
                                <div className="text-center space-y-4">
                                    <div className="inline-block px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Master Records</div>
                                    <h2 className="text-5xl font-black text-white tracking-tighter">Global Activity Feed</h2>
                                    <p className="text-slate-500 font-medium italic max-w-2xl mx-auto">Full-spectrum surveillance of platform interaction, requests, and resource dissemination.</p>
                                </div>

                                <div className="space-y-4 relative">
                                    <div className="absolute left-8 top-12 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 via-slate-800 to-transparent"></div>
                                    {allActivities.map((act, i) => (
                                        <div key={act.id + i} className="relative flex gap-8 items-center admin-card-glass hover:bg-white/[0.04] p-8 rounded-[2.5rem] border border-white/5 transition-all group overflow-hidden">
                                             <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                             
                                             <div className="relative z-10">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all group-hover:scale-110 group-hover:rotate-3 ${
                                                    act.type === 'request' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-xl shadow-blue-500/10' :
                                                    act.type === 'review' ? 'bg-rose-600/10 border-rose-500/20 text-rose-400 shadow-xl shadow-rose-500/10' :
                                                    'bg-amber-600/10 border-amber-500/20 text-amber-400 shadow-xl shadow-amber-500/10'
                                                }`}>
                                                    <span className="text-3xl">{act.type === 'request' ? '🤝' : act.type === 'review' ? '⭐' : '📦'}</span>
                                                </div>
                                             </div>

                                             <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight mb-1">{act.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest">{act.date.toLocaleDateString()}</span>
                                                            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                                                            <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest">{act.date.toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                       <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                                                           act.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                           act.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                           'bg-white/5 text-slate-500 border-white/10'
                                                       }`}>
                                                           {act.status}
                                                       </span>
                                                       {renderBlockButton(act.userId, true)}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-slate-300 text-lg font-medium mb-5">{act.content}</p>
                                                
                                                {act.meta && (
                                                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 italic text-sm text-slate-400 font-medium relative group-meta overflow-hidden">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/30"></div>
                                                        <span className="text-indigo-400/50 text-xs font-black block mb-2 uppercase tracking-widest">Metadata Fragment</span>
                                                        "{act.meta}"
                                                    </div>
                                                )}
                                             </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'users' && (
                            <section className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">👥</div>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Directory Management</span>
                                        </div>
                                        <h2 className="text-5xl font-black text-white tracking-tighter">Identity Core</h2>
                                        <p className="text-slate-500 font-medium mt-1 font-bold uppercase tracking-[0.2em] text-[10px]">Total Authenticated Records: <span className="text-indigo-400">{users.length}</span></p>
                                    </div>
                                    
                                    <div className="flex admin-card-glass border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
                                        <button 
                                            onClick={() => setUserTypeTab('mentor')}
                                            className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1.5rem] flex items-center gap-3 ${userTypeTab === 'mentor' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <span>👨‍🏫</span> Mentors
                                        </button>
                                        <button 
                                            onClick={() => setUserTypeTab('mentee')}
                                            className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1.5rem] flex items-center gap-3 ${userTypeTab === 'mentee' ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <span>👨‍🎓</span> Mentees
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    <div className={`space-y-6 animate-in fade-in slide-in-from-${userTypeTab === 'mentor' ? 'left' : 'right'}-4 duration-500`}>
                                        <div className="hidden md:block admin-card-glass rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-white/[0.03] border-b border-white/10">
                                                        <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Identity</th>
                                                        {userTypeTab === 'mentor' && <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocol Focus</th>}
                                                        <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Access Status</th>
                                                        <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-right">Operations</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {users.filter(u => u.role === userTypeTab).map(u => (
                                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-10 py-8">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="relative group/avatar">
                                                                        <UserAvatar src={u.avatar} name={u.name} size={64} className="rounded-2xl border-2 border-white/10 shadow-lg group-hover:border-indigo-500/50 transition-all duration-500 group-hover/avatar:scale-110" />
                                                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f172a] ${u.isBlocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-black text-white text-xl tracking-tight leading-none mb-1.5 group-hover:text-indigo-400 transition-colors">{u.name}</p>
                                                                        <p className="text-xs font-bold text-slate-600 font-mono truncate">{u.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {userTypeTab === 'mentor' && (
                                                                <td className="px-10 py-8">
                                                                    <p className="text-[11px] font-black text-indigo-400/80 uppercase tracking-[0.15em] bg-indigo-400/5 px-4 py-1.5 rounded-full border border-indigo-400/10 inline-block">{u.specialization || 'General Protocol'}</p>
                                                                </td>
                                                            )}
                                                            <td className="px-10 py-8">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2 h-2 rounded-full ${u.isBlocked ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'}`}></div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${u.isBlocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                        {u.isBlocked ? 'BANNED' : 'NOMINAL'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-8 text-right">
                                                                {renderBlockButton(u.id)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile User Cards */}
                                        <div className="grid grid-cols-1 gap-6 md:hidden">
                                            {users.filter(u => u.role === userTypeTab).map(u => (
                                                <div key={u.id} className="admin-card-glass border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-xl relative overflow-hidden">
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative">
                                                            <UserAvatar src={u.avatar} name={u.name} size={72} className="rounded-[1.5rem] border-2 border-white/10" />
                                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0f172a] ${u.isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="font-black text-white text-2xl tracking-tighter truncate">{u.name}</p>
                                                            <p className="text-xs font-bold text-slate-500 truncate font-mono">{u.email}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                                                            <p className={`text-[10px] font-black uppercase ${u.isBlocked ? 'text-rose-500' : 'text-emerald-500'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</p>
                                                        </div>
                                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Role</p>
                                                            <p className="text-[10px] font-black text-indigo-400 uppercase">{u.role}</p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        {renderBlockButton(u.id, false)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
