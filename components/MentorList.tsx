import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Mentor } from '../types';
import UserAvatar from './UserAvatar';

const isSlotExpired = (date: string, time: string): boolean => {
  return new Date(`${date}T${time}`) < new Date();
};

const MentorList: React.FC<{ user: User | null }> = ({ user }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [requestsSent, setRequestsSent] = useState<Record<string, boolean>>({});

  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorsData = await api.users.getMentors();
        setMentors(mentorsData as Mentor[]);

        if (user) {
          const myRequests = await api.requests.getRequestsForUser(user.id, user.role);
          const sentMap: Record<string, boolean> = {};
          myRequests.forEach(req => {
            if (req.status === 'pending') {
              sentMap[req.mentorId] = true;
            }
          });
          setRequestsSent(sentMap);
        }
      } catch (err) {
        console.error("Failed fetching mentors", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedSlot('');
    setBookingSuccess('');
    setIsBooking(false);
  };

  const handleBook = async (mentor: Mentor) => {
    if (!user || !selectedSlot) return;
    setIsBooking(true);
    try {
      await api.requests.sendRequest(user.id, mentor.id, user.name, mentor.name, selectedSlot);
      setRequestsSent(prev => ({ ...prev, [mentor.id]: true }));
      setBookingSuccess(`Request sent to ${mentor.name} for ${selectedSlot}!`);
      setTimeout(() => {
        setSelectedMentor(null);
        setBookingSuccess('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.specialization && mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    mentor.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Find Your Perfect Mentor</h3>
            <p className="text-slate-500 mt-2 text-lg">Connect with industry experts who can accelerate your career growth.</p>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, or skill..."
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredMentors.map((mentor, index) => (
          <div
            key={mentor.id}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none translate-x-10 -translate-y-10"></div>

            <div className="relative flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-0 group-hover:opacity-5 transition-all duration-300"></div>
                <UserAvatar name={mentor.name} role="mentor" size={96} className="rounded-2xl ring-4 ring-white shadow-md relative z-10" />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors">{mentor.name}</h4>
                    <p className="text-sm font-medium text-slate-500">{mentor.specialization}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {mentor.skills?.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                  {mentor.skills && mentor.skills.length > 3 && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100">
                      +{mentor.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => handleOpenModal(mentor)}
                disabled={!!requestsSent[mentor.id]}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-95 ${requestsSent[mentor.id]
                  ? 'bg-emerald-100 text-emerald-700 shadow-none cursor-default'
                  : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20'
                  }`}
              >
                {requestsSent[mentor.id] ? '✓ Requested' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredMentors.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 animate-fade-in">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
            🤔
          </div>
          <h4 className="text-xl font-bold text-slate-900">No mentors found</h4>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
            We couldn't find any mentors matching "{searchTerm}". Try adjusting your search keywords.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Sessions Info Footer */}
      {!isLoading && filteredMentors.length > 0 && (
        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-slate-400 font-medium">Showing {filteredMentors.length} expert mentors ready to help you.</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <UserAvatar name={selectedMentor.name} role="mentor" size={48} className="rounded-xl shadow-sm" />
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">Book {selectedMentor.name.split(' ')[0]}</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{selectedMentor.specialization || 'Session'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-black/5 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Slots Selection */}
            <div className="p-6 overflow-y-auto">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Select a Time</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedMentor.sessionSlots && selectedMentor.sessionSlots.length > 0 ? (
                  selectedMentor.sessionSlots.map((slot, idx) => {
                    const expired = isSlotExpired(slot.date, slot.time);
                    const remaining = slot.available;
                    const disabled = expired || remaining <= 0;
                    const slotString = `${slot.date} at ${slot.time}`;
                    const isSelected = selectedSlot === slotString;

                    return (
                      <button
                        key={idx}
                        disabled={disabled}
                        onClick={() => setSelectedSlot(slotString)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${disabled
                          ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/10'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{slot.time}</div>
                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>{slot.date}</div>
                        {remaining > 0 && <div className="text-[10px] font-bold text-emerald-600 mt-1">{remaining} left</div>}
                      </button>
                    )
                  })
                ) : (
                  <div className="col-span-2 text-center py-6">
                    <p className="text-slate-500 font-medium bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">Mentor is not available at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-white space-y-3">
              {/* Success message */}
              {bookingSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <span className="text-2xl">🎉</span>
                  <p className="text-emerald-700 text-sm font-bold">{bookingSuccess}</p>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={() => handleBook(selectedMentor)}
                disabled={requestsSent[selectedMentor.id] || isBooking || !selectedSlot}
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${requestsSent[selectedMentor.id]
                  ? 'bg-emerald-100 text-emerald-700 shadow-none cursor-default'
                  : (!selectedSlot)
                    ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
              >
                {isBooking ? 'Sending Request...' : requestsSent[selectedMentor.id] ? '✓ Request Sent!' : '🗓 Book a Session'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MentorList;
