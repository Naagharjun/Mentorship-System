import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';

interface ProfileProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name || '');
    const [bio, setBio] = useState(user.bio || '');
    const [specialization, setSpecialization] = useState(user.specialization || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [skillsString, setSkillsString] = useState((user.skills || []).join(', '));
    const [availabilityString, setAvailabilityString] = useState((user.availability || []).join(', '));

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        const skills = skillsString.split(',').map(s => s.trim()).filter(s => s);
        const availability = availabilityString.split(',').map(a => a.trim()).filter(a => a);

        const updates: Partial<User> = {
            name,
            bio,
            skills,
            avatar,
            ...(user.role === 'mentor' && { specialization, availability })
        };

        try {
            const updatedUser = await api.users.updateProfile(user.id, updates);
            onUpdateUser(updatedUser);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                        <UserAvatar name={user.name} role={user.role} size={120} className="rounded-2xl ring-4 ring-white shadow-xl" />
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                            {user.role}
                        </span>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                        <div className="flex justify-between items-start">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {successMessage && (
                            <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 rounded-2xl">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-rose-50 text-rose-700 text-sm font-bold border border-rose-100 rounded-2xl">
                                {error}
                            </div>
                        )}

                        {!isEditing ? (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                                    <p className="text-lg font-bold text-slate-900">{user.name}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</p>
                                    <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl text-sm border border-slate-100">{user.bio || 'No bio provided.'}</p>
                                </div>

                                {user.role === 'mentor' && (
                                    <>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Specialization</p>
                                            <p className="text-slate-900 font-medium">{user.specialization || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Availability</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.availability && user.availability.length > 0 ? (
                                                    user.availability.map((a, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                                                            {a}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-500 text-sm">Not specified</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills && user.skills.length > 0 ? (
                                            user.skills.map(skill => (
                                                <span key={skill} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-500 text-sm">No skills listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profile Image</label>
                                    <div className="flex items-center gap-4">
                                        {avatar && (
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-200">
                                                <img src={avatar} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-white"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1.5">Max size: 5MB · JPG, PNG, GIF, WEBP</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                {user.role === 'mentor' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specialization</label>
                                            <input
                                                type="text"
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="e.g. Frontend Engineering, Data Science..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Availability (comma separated)</label>
                                            <input
                                                type="text"
                                                value={availabilityString}
                                                onChange={(e) => setAvailabilityString(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="e.g. Mon 9-11 AM, Thu 4-6 PM"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills (comma separated)</label>
                                    <input
                                        type="text"
                                        value={skillsString}
                                        onChange={(e) => setSkillsString(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="e.g. React, Python, UI Design"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Profile'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        disabled={isLoading}
                                        className="px-6 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
