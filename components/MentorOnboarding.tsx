import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface Props {
    user: User;
    onComplete: (updatedUser: User) => void;
    onLogout: () => void;
}

const MentorOnboarding: React.FC<Props> = ({ user, onComplete, onLogout }) => {
    const [specialization, setSpecialization] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert comma-separated skills to proper {name, proficiency} objects
        const skillsArray = skills.split(',').map(s => ({
            name: s.trim(),
            proficiency: 'Beginner' as const
        })).filter(s => s.name);

        try {
            const updatedUser = await api.users.updateProfile(user.id, {
                specialization,
                bio,
                skills: skillsArray,
            });
            onComplete(updatedUser);
        } catch (err: any) {
            console.error("Failed to update profile", err);
            setError(err.message || 'Failed to save profile. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-500/30">
            <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 flex flex-col items-center">

                <button
                    type="button"
                    onClick={onLogout}
                    className="self-start flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors mb-2 -ml-1"
                >
                    ← Back to Login
                </button>

                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
                    🎓
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2 text-center">Complete Your Profile</h2>
                <p className="text-slate-500 font-medium text-center mb-8 max-w-sm">
                    Mentees are looking for your expertise. Please provide a few more details to activate your Mentor account.
                </p>

                {error && (
                    <div className="w-full p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Specialization</label>
                        <input
                            type="text"
                            required
                            value={specialization}
                            onChange={e => setSpecialization(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Technical Skills (comma separated)</label>
                        <input
                            type="text"
                            required
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                            placeholder="e.g. React, Node.js, Graph Databases"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Short Bio</label>
                        <textarea
                            required
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell mentees about your experience and how you can help..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium resize-none"
                        ></textarea>
                    </div>


                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none mt-4"
                    >
                        {isSubmitting ? 'Saving Profile...' : 'Complete Profile & Continue'}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-2">
                        Having trouble?{' '}
                        <button
                            type="button"
                            onClick={onLogout}
                            className="font-bold text-slate-500 hover:text-slate-700 underline"
                        >
                            Go back and try logging in again
                        </button>
                    </p>
                </form>

            </div>
        </div>
    );
};

export default MentorOnboarding;
