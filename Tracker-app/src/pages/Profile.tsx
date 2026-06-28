import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { userService } from '../services/userService';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 2) {
      showToast('Name must be at least 2 characters', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({ name: newName.trim() });
      updateUser(updated);
      setIsEditingName(false);
      showToast('Name updated! ✅', 'success');
    } catch {
      showToast('Failed to update name', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
  };

  return (
    <div className="min-h-screen pb-28 bg-[#0a0d14] text-[#f1f5f9] lg:max-w-[480px] lg:mx-auto lg:border-x lg:border-white/5">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">👤 Profile</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Avatar + Info */}
        <div className="bg-[#141927] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-white/10 transition-colors">
          <div className="w-20 h-20 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-full flex items-center justify-center text-3xl font-black text-indigo-400">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>

          {isEditingName ? (
            <div className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase" htmlFor="edit-name">Display Name</label>
                <input
                  id="edit-name"
                  className="w-full bg-[#1a2035] border border-white/5 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  placeholder="Your name"
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
                  onClick={handleSaveName}
                  disabled={isSaving}
                  id="save-name-btn"
                >
                  {isSaving ? <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Save'}
                </button>
                <button
                  className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors active:scale-95"
                  onClick={() => { setIsEditingName(false); setNewName(user?.name || ''); }}
                  id="cancel-name-btn"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-100 mb-0.5">
                  {user?.name}
                </p>
                <p className="text-sm text-slate-500 font-medium">@{user?.username}</p>
              </div>
              <button
                className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-semibold py-2 px-3.5 rounded-xl cursor-pointer transition-colors active:scale-95"
                onClick={() => setIsEditingName(true)}
                id="edit-name-btn"
              >
                ✏️ Edit Name
              </button>
            </>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-[#141927] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3.5">Account Details</p>
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Username</span>
              <span className="font-semibold text-slate-200">
                @{user?.username}
              </span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Member since</span>
              <span className="font-semibold text-slate-200">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          id="logout-btn"
          className="w-full bg-rose-500/10 hover:bg-rose-500 border border-rose-500/25 text-rose-500 hover:text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 active:scale-98 cursor-pointer mt-4 flex items-center justify-center gap-2"
          onClick={() => setShowLogoutModal(true)}
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-fade-in" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-[#141927] border border-white/10 rounded-2xl p-6 w-full max-w-[340px] shadow-2xl relative z-50 flex flex-col gap-4 animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-lg font-bold text-slate-100 mb-1">Sign out?</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                You'll need to sign in again to access your attendance data.
              </p>
            </div>
            
            <div className="flex gap-3 mt-1">
              <button
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-sm font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors active:scale-95"
                onClick={() => setShowLogoutModal(false)}
                id="logout-cancel"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-95 shadow-lg shadow-rose-600/20"
                onClick={handleLogout}
                id="logout-confirm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Profile;

