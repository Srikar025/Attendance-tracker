import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/track', label: 'Track', icon: '📊' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#141927]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 pb-2 z-50 shadow-2xl lg:max-w-[480px] lg:left-1/2 lg:-translate-x-1/2 lg:rounded-t-2xl lg:border-x lg:border-white/5">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase()}`}
            className="relative flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95 cursor-pointer"
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-70'}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;

