import '../styles/globals.css';
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import StationeryBackground from '../components/StationeryBackground';
import { LiveVercelQR } from '../components/LiveVercelQR';
import { useAuth } from '../contexts/AuthContext';
import {
  Feather,
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  RotateCcw,
  BarChart3,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isNotebook = location.pathname === '/notebook' || location.pathname === '/dashboard';

  const navLinks = [
    { name: 'Notebook', path: '/notebook', icon: LayoutDashboard },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Mind Mirror', path: '/mind-mirror', icon: BrainCircuit },
    { name: 'Review Center', path: '/review-center', icon: RotateCcw },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  if (isNotebook) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent text-[#242725] overflow-x-hidden">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-[#242725] overflow-x-hidden">
      <StationeryBackground />

      {/* Spatial Zen Frosted Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full bg-white/40 backdrop-blur-xl border-b border-white/50 px-4 md:px-8 py-3 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#5B8266]/15 border border-[#5B8266]/30 flex items-center justify-center text-[#43634D] shadow-xs">
              <Feather className="w-4 h-4 text-[#5B8266]" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-sm font-bold tracking-tight text-[#242725]">
                Mind Mirror
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60 text-[#43634D] border border-white/70 font-mono">
                Spatial Zen
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-white/80 text-[#43634D] border border-white/90 font-semibold shadow-xs'
                      : 'text-[#6D736E] hover:text-[#242725] hover:bg-white/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3 shrink-0">
            <LiveVercelQR />

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/40">
              <div className="w-7 h-7 rounded-full bg-white/60 text-[#43634D] border border-white/70 flex items-center justify-center font-mono text-xs font-semibold shadow-2xs">
                {user?.fullName?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[#6D736E] hover:text-[#B86B43] hover:bg-white/50 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>

      {/* Frosted Footer */}
      <footer className="border-t border-white/40 bg-white/20 backdrop-blur-md py-4 px-6 text-center text-xs text-[#6D736E] flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full rounded-t-xl">
        <span>Mind Mirror &bull; Spatial Zen Study Workspace</span>
        <span>Powered by Nexus AI Engine</span>
      </footer>
    </div>
  );
};
