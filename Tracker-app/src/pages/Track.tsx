import React, { useState, useEffect, useCallback } from 'react';
import BottomNav from '../components/BottomNav';
import { RecordListSkeleton } from '../components/SkeletonLoader';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../components/Toast';
import type { DailyRecord } from '../types';

const formatDate = (dateStr: string) => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
};


const getBadgeStyles = (pct: number) => {
  if (pct >= 75) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (pct >= 60) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
};

interface EditState {
  id: string;
  held: string;
  attended: string;
}

const Track: React.FC = () => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await attendanceService.getHistory();
      setRecords(data);
    } catch {
      showToast('Failed to load history', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filteredRecords = searchDate
    ? records.filter((r) => r.date === searchDate)
    : records;

  const startEdit = (record: DailyRecord) => {
    setEditState({
      id: record._id,
      held: String(record.classesHeld),
      attended: String(record.classesAttended),
    });
  };

  const cancelEdit = () => setEditState(null);

  const saveEdit = async (record: DailyRecord) => {
    if (!editState) return;
    const held = parseInt(editState.held);
    const attended = parseInt(editState.attended);

    if (isNaN(held) || held < 0 || held > 20) {
      showToast('Classes held must be 0-20', 'error'); return;
    }
    if (isNaN(attended) || attended < 0 || attended > held) {
      showToast('Attended cannot exceed held', 'error'); return;
    }

    setIsSaving(true);
    try {
      const result = await attendanceService.updateDaily(record._id, { classesHeld: held, classesAttended: attended });
      setRecords((prev) =>
        prev.map((r) => r._id === record._id ? result.dailyRecord : r)
      );
      setEditState(null);
      showToast('Record updated! ✅', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-[#0a0d14] text-[#f1f5f9] lg:max-w-[480px] lg:mx-auto lg:border-x lg:border-white/5">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">📊 Attendance History</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Search / Date Picker */}
        <div className="bg-[#141927] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="track-date-search">Search by date</label>
            <div className="flex gap-2">
              <input
                id="track-date-search"
                className="flex-1 bg-[#1a2035] border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                type="date"
                value={searchDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSearchDate(e.target.value)}
              />
              {searchDate && (
                <button
                  className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors active:scale-95"
                  onClick={() => setSearchDate('')}
                  id="track-clear-search"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Record count */}
        {!isLoading && (
          <p className="text-xs text-slate-500 font-medium pl-1">
            {searchDate
              ? filteredRecords.length === 0
                ? 'No record found for this date'
                : `Showing record for ${formatDate(searchDate)}`
              : `${records.length} record${records.length !== 1 ? 's' : ''} total`}
          </p>
        )}

        {/* List */}
        {isLoading ? (
          <RecordListSkeleton />
        ) : filteredRecords.length === 0 && !searchDate ? (
          <div className="bg-[#141927] border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-300 font-bold">No records yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Go to Home and log today's attendance.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredRecords.map((record) => {
              const pct = record.classesHeld > 0
                ? Math.round((record.classesAttended / record.classesHeld) * 100)
                : 0;
              const isEditing = editState?.id === record._id;

              return (
                <div key={record._id} className="bg-[#141927] border border-white/5 rounded-2xl p-4.5 flex flex-col gap-3 hover:border-white/10 hover:bg-[#1a2035]/30 transition-all">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">{formatDate(record.date)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyles(pct)}`}>
                      {pct}%
                    </span>
                  </div>

                  {isEditing ? (
                    /* Edit mode */
                    <div className="flex flex-col gap-3.5 mt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase" htmlFor={`edit-held-${record._id}`}>Held</label>
                          <input
                            id={`edit-held-${record._id}`}
                            className="w-full bg-[#1a2035] border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                            type="number" min={0} max={20}
                            value={editState.held}
                            onChange={(e) => setEditState(p => p ? { ...p, held: e.target.value } : p)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase" htmlFor={`edit-attended-${record._id}`}>Attended</label>
                          <input
                            id={`edit-attended-${record._id}`}
                            className="w-full bg-[#1a2035] border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                            type="number" min={0}
                            value={editState.attended}
                            onChange={(e) => setEditState(p => p ? { ...p, attended: e.target.value } : p)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors active:scale-95 flex items-center justify-center gap-1.5"
                          onClick={() => saveEdit(record)}
                          disabled={isSaving}
                          id={`save-edit-${record._id}`}
                        >
                          {isSaving ? <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Save'}
                        </button>
                        <button
                          className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors active:scale-95"
                          onClick={cancelEdit}
                          id={`cancel-edit-${record._id}`}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <p className="text-xl font-extrabold tracking-tight">
                          {record.classesAttended}
                          <span className="text-slate-600 font-normal"> / </span>
                          {record.classesHeld}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                          attended / held
                        </p>
                      </div>
                      <button
                        className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl cursor-pointer transition-colors active:scale-95"
                        onClick={() => startEdit(record)}
                        id={`edit-record-${record._id}`}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Track;

