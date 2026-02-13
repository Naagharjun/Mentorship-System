
import React, { useState } from 'react';
import { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
  onToggleLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onToggleLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate API delay
    setTimeout(() => {
      onRegister({
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        name: name || 'New User',
        email: email || 'user@example.com',
        role: 'mentee',
        avatar: `https://picsum.photos/seed/${name || 'user'}/200`,
        skills: [],
        bio: 'Just joined MentorLink Pro!',
        password: password
      });
      setIsLoading(false);
    }, 1500);
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
              <img src="https://picsum.photos/seed/marcus/100" className="w-12 h-12 rounded-full border-2 border-indigo-400 shadow-inner" alt="Sarah" />
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
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
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

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3 text-lg mt-4"
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
