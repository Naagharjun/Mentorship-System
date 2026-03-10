
import React, { useState } from 'react';
import { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => Promise<void>;
  onToggleLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onToggleLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'mentee' | 'mentor'>('mentee');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Create user object (ID will be assigned by API/Backend)
      // Note: In a real app we'd send just the data, but our mock register expects a User object
      // We'll trust the API to overwrite ID if needed or just send what we have.
      const newUser: User = {
        id: '', // API will assign
        name: name || 'New User',
        email: email || 'user@example.com',
        role: role,
        avatar: '',
        skills: [],
        bio: 'Just joined MentorLink Pro!',
        password: password // Adding password to user object for our mock backend to save it
      };

      await onRegister(newUser);
      // App.tsx handles the state update and redirection
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side - Visual/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <span className="text-5xl drop-shadow-lg">🧩</span>
            <span className="tracking-tight">MentorLink Pro</span>
          </h1>
          <p className="text-indigo-100 text-lg max-w-md font-medium leading-relaxed">
            Begin your transformation today. Connect with industry experts and build a future you're proud of.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
            <p className="text-xl italic text-indigo-50 mb-6 font-light leading-relaxed">
              "Joining this community was the single best decision for my technical growth. The personalized paths are incredible."
            </p>
            <div className="flex items-center gap-4">
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 rounded-full border-2 border-indigo-400 shadow-inner flex-shrink-0">
                <rect width="40" height="40" rx="20" fill="rgba(99,102,241,0.15)" />
                <circle cx="20" cy="15" r="7" fill="#818cf8" />
                <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#818cf8" />
              </svg>

              <div>
                <p className="font-bold text-base">Marcus Rodriguez</p>
                <p className="text-sm text-indigo-200/80">Product Lead at DesignIO</p>
              </div>
            </div>
          </div>
          <p className="mt-8 text-sm text-indigo-200/60 font-medium">© 2025 MentorLink Pro. Future of Learning.</p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-tr from-slate-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-md w-full bg-white/40 backdrop-blur-sm p-4 rounded-3xl">
          <div className="mb-8 text-center lg:text-left px-4">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Create Profile</h2>
            <p className="text-slate-500 font-medium">Join 5,000+ experts and learners</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">⚠️</div>
                  <p className="text-xs font-bold leading-tight">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">I want to be a:</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'mentee' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-200'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="mentee"
                      checked={role === 'mentee'}
                      onChange={() => setRole('mentee')}
                      className="hidden"
                    />
                    <span className="text-2xl">👨‍🎓</span>
                    <span className="font-bold text-sm">Mentee</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'mentor' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-purple-200'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="mentor"
                      checked={role === 'mentor'}
                      onChange={() => setRole('mentor')}
                      className="hidden"
                    />
                    <span className="text-2xl">👩‍🏫</span>
                    <span className="font-bold text-sm">Mentor</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3 text-lg mt-6"
              >
                {isLoading ? (
                  <>
                    <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating Account...
                  </>
                ) : 'Get Started Now'}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Already registered? <button onClick={onToggleLogin} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
