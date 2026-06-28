import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Username is required'); return; }
    if (!password) { setError('Password is required'); return; }

    setIsLoading(true);
    try {
      const data = await authService.login({ username: username.toLowerCase().trim(), password });
      login(data.token, data.user);
      showToast(`Welcome back, ${data.user.name}! 👋`, 'success');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
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
        
        <h1 className="text-2xl font-bold text-center mb-1.5 tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-400 text-center mb-7">Sign in to your attendance tracker</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm py-3 px-3.5 text-center" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="w-full bg-[#1a2035] border border-white/5 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="w-full bg-[#1a2035] border border-white/5 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};