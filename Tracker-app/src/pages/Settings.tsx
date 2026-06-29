import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { userService } from '../services/userService';
import CircularProgress from '../components/CircularProgress';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Initialize directly from the user object already in AuthContext —
  // no extra API call needed (Home already fetched this data).
  const [totalHeld, setTotalHeld] = useState(() => String(user?.totalClassesHeld ?? 0));
  const [totalAttended, setTotalAttended] = useState(() => String(user?.totalClassesAttended ?? 0));
  const [percentage, setPercentage] = useState(() => {
    const h = user?.totalClassesHeld ?? 0;
    const a = user?.totalClassesAttended ?? 0;
    return h > 0 ? Math.round((a / h) * 100 * 10) / 10 : 0;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Live calculate percentage
  useEffect(() => {
    const held = parseInt(totalHeld);
    const attended = parseInt(totalAttended);
    if (!isNaN(held) && !isNaN(attended) && held > 0) {
      setPercentage(Math.round((attended / held) * 100 * 10) / 10);
    } else {
      setPercentage(0);
    }
  }, [totalHeld, totalAttended]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const held = parseInt(totalHeld);
    const attended = parseInt(totalAttended);
    if (isNaN(held) || held < 0 || !Number.isInteger(held)) errs.held = 'Must be a non-negative integer';
    if (isNaN(attended) || attended < 0 || !Number.isInteger(attended)) errs.attended = 'Must be a non-negative integer';
    if (!isNaN(held) && !isNaN(attended) && attended > held) errs.attended = 'Cannot exceed total classes held';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const result = await userService.updateTotals({
        totalClassesHeld: parseInt(totalHeld),
        totalClassesAttended: parseInt(totalAttended),
      });
      updateUser(result.user);
      setPercentage(result.percentage);
      showToast('Totals updated successfully! ✅', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getPercentColor = () => {
    if (percentage >= 75) return 'text-emerald-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen pb-28 bg-[#0a0d14] text-[#f1f5f9] lg:max-w-[480px] lg:mx-auto lg:border-x lg:border-white/5">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">⚙️ Settings</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Attendance Overview */}
        <div className="bg-[#141927] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-white/10 transition-colors">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Attendance</p>
          <CircularProgress percentage={percentage} size={160} strokeWidth={12} />
        </div>

        {/* Manual Override */}
        <div className="bg-[#141927] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Manual Override</p>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex gap-2.5 items-start text-xs text-amber-400 leading-relaxed mb-4">
            <span className="text-sm leading-none">⚠️</span>
            <span>Manually changing these values will override your calculated totals. This cannot be undone automatically.</span>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="settings-total-held">Total Classes Held</label>
              <input
                id="settings-total-held"
                className={`w-full bg-[#1a2035] border rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.held 
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' 
                    : 'border-white/5 focus:border-indigo-500 focus:ring-indigo-500/10'
                }`}
                type="number" min={0}
                value={totalHeld}
                onChange={(e) => { setTotalHeld(e.target.value); setErrors(p => ({ ...p, held: '' })); }}
              />
              {errors.held && <p className="text-xs text-rose-500 mt-1 pl-1">{errors.held}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="settings-total-attended">Total Classes Attended</label>
              <input
                id="settings-total-attended"
                className={`w-full bg-[#1a2035] border rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.attended 
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' 
                    : 'border-white/5 focus:border-indigo-500 focus:ring-indigo-500/10'
                }`}
                type="number" min={0}
                value={totalAttended}
                onChange={(e) => { setTotalAttended(e.target.value); setErrors(p => ({ ...p, attended: '' })); }}
              />
              {errors.attended && <p className="text-xs text-rose-500 mt-1 pl-1">{errors.attended}</p>}
            </div>

            <div className="bg-[#1a2035] border border-white/5 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Calculated attendance</span>
              <span className={`text-lg font-black tracking-tight ${getPercentColor()}`}>
                {percentage}%
              </span>
            </div>

            <button
              id="settings-save-btn"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-1"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-[#141927] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3.5">About</p>
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">App Name</span>
              <span className="font-semibold text-slate-200">AttendTrack</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Version</span>
              <span className="font-semibold text-slate-200">1.0.0</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Account</span>
              <span className="font-semibold text-slate-200">@{user?.username}</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;

