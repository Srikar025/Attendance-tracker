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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heldNum, setHeldNum] = useState<number>(6);
  const [attendedNum, setAttendedNum] = useState<number | null>(null);

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

  const handleSelectHeld = (num: number) => {
    if (isSubmitting) return;
    setHeldNum(num);
    // If the new number of classes held is less than the current attended classes selection,
    // reset or clamp the attended classes selection
    if (attendedNum !== null && attendedNum > num) {
      setAttendedNum(null);
    }
  };

  const handleSelectAttended = (num: number) => {
    if (isSubmitting || num > heldNum) return;
    setAttendedNum(num);
  };

  const handleSubmitAttendance = async () => {
    if (attendedNum === null || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await attendanceService.createDaily({
        date: getTodayString(),
        classesHeld: heldNum,
        classesAttended: attendedNum,
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
          <div className="bg-[#141927] border border-white/5 rounded-2xl p-5 hover:border-[#1e293b] transition-all duration-200 shadow-xl">
            <p className="text-sm font-bold text-slate-100 mb-4">📅 Today's Update</p>
            
            {/* Total Classes Held Row */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Classes Held Today</p>
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {[0, 1, 2, 3, 4, 5, 6].map((num) => {
                const isSelected = heldNum === num;
                return (
                  <button
                    key={`held-${num}`}
                    onClick={() => handleSelectHeld(num)}
                    disabled={isSubmitting}
                    className={`h-11 rounded-xl font-bold text-sm transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border border-indigo-500 shadow-lg shadow-indigo-600/30'
                        : 'bg-[#1a2035] border border-white/5 text-slate-200 hover:bg-white/5 hover:border-indigo-500/40'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Classes Attended Row */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Classes Attended Today</p>
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {[0, 1, 2, 3, 4, 5, 6].map((num) => {
                const isSelected = attendedNum === num;
                const isDisabled = num > heldNum; // cannot attend more than classes held
                
                // Color coding for select / hover states
                const getButtonStyles = () => {
                  if (isDisabled) {
                    return 'bg-slate-900/40 border border-white/5 text-slate-600 cursor-not-allowed opacity-20';
                  }
                  if (isSelected) {
                    if (num === 0) return 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500';
                    if (num <= 2) return 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-500';
                    if (num === heldNum && heldNum > 0) return 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500'; // 100% attendance
                    return 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500';
                  }
                  
                  const base = 'bg-[#1a2035] border border-white/5 text-slate-200 hover:bg-white/5';
                  if (num === 0) return `${base} hover:border-rose-500/40`;
                  if (num <= 2) return `${base} hover:border-amber-500/40`;
                  if (num === heldNum) return `${base} hover:border-emerald-500/40`;
                  return `${base} hover:border-indigo-500/40`;
                };

                return (
                  <button
                    key={`attended-${num}`}
                    onClick={() => handleSelectAttended(num)}
                    disabled={isDisabled || isSubmitting}
                    className={`h-11 rounded-xl font-bold text-sm transition-all duration-150 active:scale-90 flex items-center justify-center ${getButtonStyles()}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <button
              id="attendance-submit-btn"
              onClick={handleSubmitAttendance}
              disabled={attendedNum === null || isSubmitting}
              className={`w-full mt-5 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer ${
                attendedNum === null
                  ? 'bg-[#1a2035] text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/35 border border-indigo-500'
              }`}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Update Attendance'
              )}
            </button>


            <p className="text-[10px] text-slate-500 text-center italic mt-3">
              * Assumes a standard 6-class day. You can edit this in the History tab later if needed.
            </p>
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
