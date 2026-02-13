
import React, { useState } from 'react';

interface Session {
  id: number;
  title: string;
  mentor: string;
  date: string; // Format: "Oct 18, 2024" or similar
  time: string;
  status: 'upcoming' | 'pending' | 'completed';
}

const Scheduling: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  const sessions: Session[] = [
    { id: 1, title: 'Career Strategy', mentor: 'James Wilson', date: 'Oct 18, 2024', time: '2:00 PM', status: 'upcoming' },
    { id: 2, title: 'Code Review: Golang Microservices', mentor: 'Elena Volkov', date: 'Oct 22, 2024', time: '10:00 AM', status: 'pending' },
    { id: 3, title: 'Figma Prototyping Workshop', mentor: 'Marcus Rodriguez', date: 'Oct 30, 2024', time: '4:00 PM', status: 'completed' },
    { id: 4, title: 'AI Ethics Discussion', mentor: 'Dr. Sarah Chen', date: 'Nov 05, 2024', time: '11:00 AM', status: 'upcoming' },
  ];

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-slate-100 bg-slate-50/30"></div>);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = new Date(year, month, d).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }).replace(',', '');
      
      const daySessions = sessions.filter(s => {
        // Simple string matching for demo purposes
        const sDate = new Date(s.date).toDateString();
        const cDate = new Date(year, month, d).toDateString();
        return sDate === cDate;
      });

      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      days.push(
        <div key={d} className={`h-32 border border-slate-100 p-2 transition-colors hover:bg-blue-50/30 relative group ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
          <span className={`text-xs font-black mb-1 inline-block w-6 h-6 leading-6 text-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400'}`}>
            {d}
          </span>
          
          <div className="mt-1 space-y-1 overflow-hidden">
            {daySessions.map(session => (
              <div key={session.id} className="text-[9px] font-black truncate px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-blue-600 shadow-sm group-hover:border-blue-200 transition-all">
                {session.time} • {session.mentor.split(' ')[0]}
              </div>
            ))}
          </div>

          {daySessions.length > 0 && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Calendar
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            List
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

        <button className="bg-blue-600 text-white text-xs font-black px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest active:scale-95">
          + Book Session
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Topic / Mentor</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-900 tracking-tight text-lg group-hover:text-blue-600 transition-colors">{session.title}</div>
                    <div className="text-sm font-bold text-slate-400 mt-1">{session.mentor}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-slate-900 font-black">{session.date}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">{session.time}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      session.status === 'upcoming' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      session.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-sm font-black text-blue-600 hover:text-blue-800 transition-all uppercase tracking-widest underline decoration-2 underline-offset-4">
                      {session.status === 'upcoming' ? 'Join Call' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Footer Marketing/Queue */}
      <div className="p-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="max-w-xl mx-auto relative z-10">
          <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Need urgent guidance?</h3>
          <p className="text-indigo-200/70 mb-8 font-medium leading-relaxed">Our priority flash queue matches you with mentors available right now for immediate 15-minute high-impact consultations.</p>
          <button className="bg-white text-slate-900 font-black px-10 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-sm active:scale-95">
            Enter Flash Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scheduling;
