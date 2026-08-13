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

  // Forgot password modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Username or Email is required'); return; }
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!forgotIdentifier.trim()) {
      setModalError('Please enter your email address or username');
      return;
    }

    setIsModalLoading(true);
    try {
      const res = await authService.forgotPassword(forgotIdentifier.trim());
      setResetEmail(res.email || forgotIdentifier.trim());
      setForgotStep('RESET');
      showToast('OTP sent! Please check your email inbox.', 'info');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send OTP. Please try again.';
      setModalError(msg);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setModalError('Please enter the 6-digit OTP code sent to your email');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setModalError('New password must be at least 6 characters');
      return;
    }

    setIsModalLoading(true);
    try {
      await authService.resetPassword({
        email: resetEmail,
        otp: otp.trim(),
        newPassword,
      });
      showToast('Password reset successfully! You can now log in with your new password.', 'success');
      setIsForgotModalOpen(false);
      setUsername(resetEmail);
      setPassword('');
      setForgotStep('REQUEST');
      setForgotIdentifier('');
      setOtp('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Password reset failed. Please check your OTP and try again.';
      setModalError(msg);
    } finally {
      setIsModalLoading(false);
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
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="login-username">Username or Email</label>
            <input
              id="login-username"
              className="w-full bg-[#1a2035] border border-white/5 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              type="text"
              placeholder="username or email@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="login-password">Password</label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setForgotStep('REQUEST');
                  setModalError('');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-1"
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

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#141927] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl p-1 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-slate-100 mb-1">
              {forgotStep === 'REQUEST' ? 'Reset your password' : 'Enter OTP & New Password'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              {forgotStep === 'REQUEST'
                ? "Enter your registered email address or username to receive a 6-digit OTP."
                : `Enter the 6-digit code sent to ${resetEmail} and choose a new password.`}
            </p>

            {modalError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs py-2.5 px-3 text-center mb-4" role="alert">
                {modalError}
              </div>
            )}

            {forgotStep === 'REQUEST' ? (
              <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Email or Username</label>
                  <input
                    type="text"
                    className="w-full bg-[#1a2035] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="registered@email.com or username"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="w-1/2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-2.5 rounded-xl transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isModalLoading}
                    className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isModalLoading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full bg-[#1a2035] border border-white/10 rounded-xl px-3.5 py-2.5 text-lg tracking-[0.3em] font-mono text-center text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">New Password</label>
                  <input
                    type="password"
                    className="w-full bg-[#1a2035] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('REQUEST')}
                    className="w-1/2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-2.5 rounded-xl transition-all text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isModalLoading}
                    className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isModalLoading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};