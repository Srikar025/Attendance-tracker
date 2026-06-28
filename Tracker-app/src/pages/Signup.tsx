import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (name.trim().length > 50) newErrors.name = 'Name cannot exceed 50 characters';
    if (!username.trim() || username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (username.trim().length > 20) newErrors.username = 'Username cannot exceed 20 characters';
    if (!/^[a-z0-9_]+$/i.test(username)) newErrors.username = 'Only letters, numbers, and underscores allowed';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await authService.signup({
        username: username.toLowerCase().trim(),
        password,
        name: name.trim(),
      });
      login(data.token, data.user);
      showToast(`Account created! Welcome, ${data.user.name}! 🎉`, 'success');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Signup failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0d14] text-[#f1f5f9] relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] bg-[#141927] border border-white/5 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-white/10">
        <div className="flex items-center justify-center mb-7">
          <div className="w-[52px] h-[52px] bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/10 animate-pulse">
            📊
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-1.5 tracking-tight">Create account</h1>
        <p className="text-sm text-slate-400 text-center mb-7">Start tracking your attendance today</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} id="signup-form">
          {errors.general && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm py-3 px-3.5 text-center" role="alert">
              {errors.general}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              className={`w-full bg-[#1a2035] border rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200 ${
                errors.name 
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' 
                  : 'border-white/5 focus:border-indigo-500 focus:ring-indigo-500/10'
              }`}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              autoComplete="name"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1 pl-1">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              className={`w-full bg-[#1a2035] border rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200 ${
                errors.username 
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' 
                  : 'border-white/5 focus:border-indigo-500 focus:ring-indigo-500/10'
              }`}
              type="text"
              placeholder="john_doe"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors(p => ({ ...p, username: '' })); }}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
            {errors.username && <p className="text-xs text-rose-500 mt-1 pl-1">{errors.username}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              className={`w-full bg-[#1a2035] border rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200 ${
                errors.password 
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' 
                  : 'border-white/5 focus:border-indigo-500 focus:ring-indigo-500/10'
              }`}
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              autoComplete="new-password"
            />
            {errors.password && <p className="text-xs text-rose-500 mt-1 pl-1">{errors.password}</p>}
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

