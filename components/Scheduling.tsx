import React, { useState, useEffect } from 'react';
import { User, ConnectionRequest } from '../types';
import { api } from '../services/api';

/** Returns true if the slot's date+time is in the past. */
const isSlotExpired = (date: string, time: string): boolean => {
  const slotDateTime = new Date(`${date}T${time}`);
  return slotDateTime < new Date();
};

/**
 * Parses a selectedSlot string like "2025-03-06 at 14:00"
 * and returns true if that datetime is in the past.
 */
const isSessionExpired = (selectedSlot?: string): boolean => {
  if (!selectedSlot) return false;
  // Format: "YYYY-MM-DD at HH:MM"
  const iso = selectedSlot.replace(' at ', 'T');
  const dt = new Date(iso);
  return !isNaN(dt.getTime()) && dt < new Date();
};

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  accepted: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  rejected: 'bg-rose-50 text-rose-500 border border-rose-100',
  cancelled: 'bg-slate-100 text-slate-400 border border-slate-200',
};

const Scheduling: React.FC<{ user: User | null }> = ({ user }) => {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // New states for Mentor Session Slots
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotCapacity, setNewSlotCapacity] = useState(1);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [sessionSlots, setSessionSlots] = useState<{ date: string, time: string, available: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const data = await api.requests.getRequestsForUser(user.id, user.role);
        const active = data.filter(r => r.status !== 'cancelled');

        // Auto-cancel any accepted/pending requests whose session slot is now in the past
        const expiredRequests = active.filter(
          r => (r.status === 'accepted' || r.status === 'pending') && isSessionExpired(r.selectedSlot)
        );

        if (expiredRequests.length > 0) {
          await Promise.allSettled(
            expiredRequests.map(r => api.requests.updateRequestStatus(r.id, 'rejected'))
          );
        }

        // Only show sessions that are NOT expired
        setRequests(active.filter(r => !isSessionExpired(r.selectedSlot)));

        // Always fetch the mentor's own profile to get up-to-date sessionSlots from the DB.
        if (user.role === 'mentor') {
          const allMentors = await api.users.getMentors();
          const myProfile = allMentors.find((m: any) => m.id === user.id);
          if (myProfile) {
            setSessionSlots((myProfile as any).sessionSlots || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch sessions', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleCancel = async (requestId: string) => {
    setCancellingId(requestId);
    try {
      await api.requests.cancelRequest(requestId);
      // Remove from mentee's list immediately; backend still stores as 'cancelled' for mentor
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Failed to cancel request', err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleCreateSlot = async () => {
    if (!user || !newSlotDate || !newSlotTime) return;
    setIsCreatingSlot(true);
    try {
      const newSlot = { date: newSlotDate, time: newSlotTime, available: newSlotCapacity };
      const updatedSlots = [...sessionSlots, newSlot];
      await api.users.updateProfile(user.id, { sessionSlots: updatedSlots });
      setSessionSlots(updatedSlots);
      setNewSlotDate('');
      setNewSlotTime('');
      setNewSlotCapacity(1);
    } catch (err) {
      console.error("Failed to create slot", err);
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const handleRemoveSlot = async (index: number) => {
    if (!user) return;
    try {
      const updatedSlots = sessionSlots.filter((_, i) => i !== index);
      await api.users.updateProfile(user.id, { sessionSlots: updatedSlots });
      setSessionSlots(updatedSlots);
    } catch (err) {
      console.error("Failed to remove slot", err);
    }
  };

  // Calendar helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 border border-slate-100 bg-slate-50/30" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const cellDate = new Date(year, month, d).toDateString();
      const daySessions = requests.filter(r => {
        const ts = new Date(r.timestamp).toDateString();
        return ts === cellDate;
      });
      const isToday = new Date().toDateString() === cellDate;

      days.push(
        <div key={d} className={`h-28 border border-slate-100 p-2 transition-colors hover:bg-blue-50/30 relative group ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
          <span className={`text-xs font-black mb-1 inline-block w-6 h-6 leading-6 text-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400'}`}>
            {d}
          </span>
          <div className="mt-1 space-y-1 overflow-hidden">
            {daySessions.map(r => (
              <div key={r.id} className="text-[9px] font-black truncate px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-blue-600 shadow-sm">
                {user?.role === 'mentee' ? r.mentorName : r.menteeName}
              </div>
            ))}
          </div>
          {daySessions.length > 0 && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Mentor Session Slots Creation UI */}
      {user?.role === 'mentor' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Create Session Slots</h3>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-medium" />
            <input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-medium" />
            <input type="number" min="1" max="10" placeholder="Capacity" value={newSlotCapacity} onChange={e => setNewSlotCapacity(parseInt(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 w-full md:w-32 font-medium" title="Number of available spots" />
            <button onClick={handleCreateSlot} disabled={isCreatingSlot || !newSlotDate || !newSlotTime} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50">
              {isCreatingSlot ? 'Creating...' : '+ Add Slot'}
            </button>
          </div>

          {sessionSlots.length > 0 && (
            <div className="space-y-3 mt-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Session Slots</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sessionSlots.map((slot, index) => {
                  const expired = isSlotExpired(slot.date, slot.time);
                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-2xl border group transition-colors ${expired
                        ? 'bg-slate-100 border-slate-200 opacity-60'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-bold ${expired ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {slot.date} at {slot.time}
                          </p>
                          {expired && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-500 border border-rose-200">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${expired ? 'text-slate-400' : 'text-slate-500'}`}>
                          {expired ? 'Slot has passed' : `${slot.available} spots available`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(index)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all shadow-sm ${expired
                          ? 'text-slate-400 hover:text-white hover:bg-slate-500 opacity-100'
                          : 'text-rose-400 hover:text-white hover:bg-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100'
                          }`}
                        title={expired ? 'Remove expired slot' : 'Delete slot'}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Calendar
          </button>
        </div>

        {viewMode === 'calendar' && (
          <div className="flex items-center gap-6">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-black text-slate-900 min-w-[160px] text-center tracking-tight">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {requests.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">📭</div>
              <h4 className="text-xl font-bold text-slate-900">No sessions yet</h4>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                {user?.role === 'mentee'
                  ? 'Go to "Find Mentors" and send a connection request to get started.'
                  : 'No mentees have connected with you yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    {user?.role === 'mentee' ? 'Mentor' : 'Mentee'}
                  </th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Requested On</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 tracking-tight text-base group-hover:text-blue-600 transition-colors">
                        {user?.role === 'mentee' ? r.mentorName : r.menteeName}
                      </div>
                      <div className="text-xs font-bold text-slate-400 mt-1">Connection Request</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm text-slate-900 font-black">
                        {new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs font-bold text-slate-400 mt-1">
                        {new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusStyles[r.status] || statusStyles.pending}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {r.status !== 'accepted' ? (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancellingId === r.id}
                          className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Confirmed ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100 last:border-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-t border-slate-100">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
