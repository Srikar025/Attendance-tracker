import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone (installed) mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // 2. Check if user already dismissed the prompt in this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // 3. Detect iOS device
    const isAppleDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
                         (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent));
    
    if (isAppleDevice) {
      setIsIOS(true);
      // Wait 3 seconds to show on iOS
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    // 4. Handle Android/Chrome beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setTimeout(() => setVisible(false), 2500);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'dismissed') {
      setInstalling(false);
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
        onClick={handleDismiss}
        style={{ animation: 'fadeIn 0.3s ease forwards' }}
      />

      {/* Banner */}
      <div
        id="pwa-install-banner"
        role="dialog"
        aria-label="Install AttendTrack app"
        className="fixed bottom-0 left-0 right-0 z-[100] lg:max-w-[480px] lg:left-1/2 lg:-translate-x-1/2"
        style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        <div className="m-3 mb-4 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
          style={{ background: 'linear-gradient(145deg, #141927 0%, #1a2035 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Glow accent line */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }} />

          <div className="p-5">
            {installed ? (
              /* Success state */
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  ✓
                </div>
                <p className="text-white font-semibold text-base">App Installed Successfully!</p>
                <p className="text-slate-400 text-sm text-center">AttendTrack is now on your home screen.</p>
              </div>
            ) : isIOS ? (
              /* iOS Install Instructions */
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      📊
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">Install AttendTrack</p>
                      <p className="text-slate-400 text-xs mt-0.5">Use it like a native app on iPhone</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 text-slate-300 text-xs leading-relaxed space-y-2">
                  <p className="font-semibold text-white">To install this app on your iPhone:</p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                    <li>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (<span className="inline-block px-1.5 py-0.5 bg-white/10 rounded">📤</span> or <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded">⎋</span>).</li>
                    <li>Scroll down the options and select <strong className="text-white">Add to Home Screen</strong>.</li>
                    <li>Tap <strong className="text-indigo-400">Add</strong> in the top-right corner to finish.</li>
                  </ol>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-full mt-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
                >
                  Close Instructions
                </button>
              </>
            ) : (
              /* Android/Chrome Prompt */
              <>
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  {/* App icon */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    📊
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base leading-tight">Install AttendTrack</p>
                    <p className="text-slate-400 text-xs mt-0.5">Add to your home screen</p>
                    {/* Feature pills */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {['Works Offline', 'No Browser UI', 'Fast'].map(f => (
                        <span key={f} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Close button */}
                  <button
                    id="pwa-dismiss-btn"
                    onClick={handleDismiss}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:bg-white/10 active:scale-90 cursor-pointer"
                    style={{ color: '#64748b' }}
                    aria-label="Dismiss install prompt"
                  >
                    ✕
                  </button>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    id="pwa-install-btn"
                    onClick={handleInstall}
                    disabled={installing}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-70 cursor-pointer"
                    style={{
                      background: installing
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 4px 15px rgba(99,102,241,0.35)'
                    }}
                  >
                    {installing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                        Installing…
                      </span>
                    ) : (
                      '📲  Install App'
                    )}
                  </button>
                  <button
                    id="pwa-nothanks-btn"
                    onClick={handleDismiss}
                    className="py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/5 active:scale-95 cursor-pointer"
                    style={{ color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    Not now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallPrompt;
