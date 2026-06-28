import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import BottomNav from '../components/BottomNav';
import CircularProgress from '../components/CircularProgress';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { attendanceService } from '../services/attendanceService';
import type { StatsResponse } from '../types';

const getTodayString = () => new Date().toISOString().split('T')[0];

const formatDate = (dateStr: string) => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
};

const Home: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayUpdated, setTodayUpdated] = useState(false);
  const [heldToday, setHeldToday] = useState('');
  const [attendedToday, setAttendedToday] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData] = await Promise.all([
        attendanceService.getStats(),
        attendanceService.getDaily(getTodayString()).then(() => setTodayUpdated(true)).catch(() => {}),
      ]);
      setStats(statsData);
    } catch {
      showToast('Failed to load stats', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    const held = parseInt(heldToday);
    const attended = parseInt(attendedToday);
    if (isNaN(held) || held < 0 || held > 20) errs.held = 'Enter a number between 0 and 20';
    if (isNaN(attended) || attended < 0) errs.attended = 'Enter a valid number';
    if (!isNaN(held) && !isNaN(attended) && attended > held) errs.attended = `Cannot exceed classes held (${held})`;
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const result = await attendanceService.createDaily({
        date: getTodayString(),
        classesHeld: parseInt(heldToday),
        classesAttended: parseInt(attendedToday),
      });
      setStats(prev => prev ? { ...prev, ...result.updatedUser } : null);
      setTodayUpdated(true);
      if (user) {
        updateUser({
          ...user,
          totalClassesHeld: result.updatedUser.totalClassesHeld,
          totalClassesAttended: result.updatedUser.totalClassesAttended,
        });
      }
      showToast('Attendance updated! ✅', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg?.includes('Already')) {
        setTodayUpdated(true);
        showToast('Already updated today!', 'info');
      } else {
        showToast(msg || 'Failed to update attendance', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <><DashboardSkeleton /><BottomNav /></>;

  const pct = stats?.percentage ?? 0;
  
  // Badge and text colors
  const getBadgeStyles = () => {
    if (pct >= 75) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (pct >= 60) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  const getPercentColor = () => {
    if (pct >= 75) return 'text-emerald-400';
    if (pct >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen pb-28 bg-[#0a0d14] text-[#f1f5f9] lg:max-w-[480px] lg:mx-auto lg:border-x lg:border-white/5">
      {/* Hero */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        
        <p className="text-sm text-slate-400 font-medium mb-6">
          👋 Hello, <strong className="text-white font-semibold">{user?.name}</strong>
        </p>
        
        <CircularProgress percentage={pct} size={200} strokeWidth={14} />
        
        <div className="mt-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getBadgeStyles()}`}>
            {todayUpdated ? '✅ Updated today' : '⚠️ Not updated yet'}
          </span>
        </div>
        <p className="mt-2.5 text-xs text-slate-500 font-medium">
          {formatDate(getTodayString())}
        </p>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#141927] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:border-white/10 transition-colors">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attended</span>
            <span className="text-2xl font-black tracking-tight">{stats?.totalAttended ?? 0}</span>
            <span className="text-xs text-slate-400">classes</span>
          </div>
          
          <div className="bg-[#141927] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:border-white/10 transition-colors">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Held</span>
            <span className="text-2xl font-black tracking-tight">{stats?.totalHeld ?? 0}</span>
            <span className="text-xs text-slate-400">classes</span>
          </div>

          <div className="bg-[#141927] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:border-white/10 transition-colors">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</span>
            <span className={`text-2xl font-black tracking-tight ${getPercentColor()}`}>
              {pct}%
            </span>
            <span className="text-xs text-slate-400">overall</span>
          </div>

          <div className="bg-[#141927] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:border-white/10 transition-colors">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Streak</span>
            <span className="text-2xl font-black tracking-tight">🔥 {stats?.streak ?? 0}</span>
            <span className="text-xs text-slate-400">days</span>
          </div>
        </div>

        {/* Update Form */}
        {!todayUpdated ? (
          <div className="bg-[#141927] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Today's Update</p>
            <form onSubmit={handleSubmit} id="attendance-form" className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="classes-held">Classes held today</label>
                <input
                  id="classes-held"
                  className={`w-full bg-[#1a2035] border rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    formErrors.held 
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' 
                      : 'border-white/5 focus:border-indigo-500 focus:ring-indigo-500/10'
                  }`}
                  type="number"
                  min={0} max={20}
                  placeholder="e.g. 6"
                  value={heldToday}
                  onChange={(e) => { setHeldToday(e.target.value); setFormErrors(p => ({ ...p, held: '' })); }}
                />
                {formErrors.held && <p className="text-xs text-rose-500 mt-1 pl-1">{formErrors.held}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="classes-attended">Classes attended today</label>
                <input
                  id="classes-attended"
                  className={`w-full bg-[#1a2035] border rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    formErrors.attended 
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' 
                      : 'border-white/5 focus:border-indigo-500 focus:ring-indigo-500/10'
                  }`}
                  type="number"
                  min={0}
                  placeholder="e.g. 5"
                  value={attendedToday}
                  onChange={(e) => { setAttendedToday(e.target.value); setFormErrors(p => ({ ...p, attended: '' })); }}
                />
                {formErrors.attended && <p className="text-xs text-rose-500 mt-1 pl-1">{formErrors.attended}</p>}
              </div>

              <button
                id="attendance-submit"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Update Attendance'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#22c55e]/5 border border-emerald-500/10 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-bold text-emerald-400 mb-0.5">
                Already updated today!
              </p>
              <p className="text-xs text-slate-400">
                Go to <strong className="text-slate-200 font-semibold">Track</strong> to edit past records.
              </p>
            </div>
          </div>
        )}

        {/* Attendance Status hint */}
        <div className="bg-[#141927] border border-white/5 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {pct >= 75
                ? '🟢 Great! You are above 75%'
                : pct >= 60
                ? '🟡 Warning: You are below 75%'
                : '🔴 Critical: Below 60% attendance!'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyles()}`}>
              {pct}%
            </span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
