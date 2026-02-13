
import React, { useState } from 'react';
import { MOCK_MENTORS } from '../constants';

const MentorList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMentors = MOCK_MENTORS.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
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
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md relative z-10"
                />
                <div className="absolute -bottom-2 -right-2 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm z-20 flex items-center gap-1">
                  <span className="text-xs">⭐</span>
                  <span className="text-xs font-bold text-slate-700">{mentor.rating}</span>
                </div>
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

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Availability</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-700">{mentor.availability[0]}</span>
                </div>
              </div>

              <button className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all">
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMentors.length === 0 && (
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
      {filteredMentors.length > 0 && (
        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-slate-400 font-medium">Showing {filteredMentors.length} expert mentors ready to help you.</p>
        </div>
      )}
    </div>
  );
};

export default MentorList;
