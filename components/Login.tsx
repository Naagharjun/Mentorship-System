
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (email: string, password: string) => { success: boolean; message?: string };
  onToggleRegister: () => void;
  registrationSuccess?: boolean;
  registeredEmail?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onToggleRegister, registrationSuccess, registeredEmail }) => {
  const [email, setEmail] = useState(registeredEmail || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const result = onLogin(email, password);
      if (!result.success) {
        setError(result.message || 'Invalid credentials');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side - Visual/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <span className="text-5xl drop-shadow-lg">🧩</span> 
            <span className="tracking-tight">MentorLink Pro</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md font-medium leading-relaxed">
            Elevate your career with elite guidance. Our AI-driven platform connects you with world-class mentors.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
            <p className="text-xl italic text-blue-50 mb-6 font-light leading-relaxed">
              "This platform completely transformed my approach to leadership. The mentor matching is unparalleled."
            </p>
            <div className="flex items-center gap-4">
              <img src="https://picsum.photos/seed/sarah/100" className="w-12 h-12 rounded-full border-2 border-blue-400 shadow-inner" alt="Sarah" />
              <div>
                <p className="font-bold text-base">Sarah Jenkins</p>
                <p className="text-sm text-blue-200/80">VP Engineering at Velocity</p>
              </div>
            </div>
          </div>
          <p className="mt-8 text-sm text-blue-200/60 font-medium">© 2025 MentorLink Pro. Global Growth Network.</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-tr from-slate-50 to-white relative overflow-hidden">
        {/* Subtle Decorative elements for the light side */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-md w-full bg-white/40 backdrop-blur-sm p-4 rounded-3xl">
          <div className="mb-10 text-center lg:text-left px-4">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Sign in to resume your learning path</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            {registrationSuccess && !error && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl shadow-sm">✅</div>
                <div>
                  <p className="text-sm font-bold">Account Ready!</p>
                  <p className="text-xs opacity-80">Login with your new credentials.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl shadow-sm">⚠️</div>
                <div>
                  <p className="text-sm font-bold">Access Denied</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2 ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</a>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                  </>
                ) : 'Sign In Now'}
              </button>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                  <span className="bg-white px-6 text-slate-400">Social Login</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm shadow-sm active:scale-95">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm shadow-sm active:scale-95">
                  <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="GitHub" />
                  GitHub
                </button>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account? <button onClick={onToggleRegister} className="font-bold text-blue-600 hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4">Create your profile</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
