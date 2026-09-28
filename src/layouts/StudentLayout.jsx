import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  Calendar,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Leaf,
  ChevronRight,
  ExternalLink,
  KeyRound,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HouseBadge from '../components/HouseBadge';
import ConfigBanner from '../components/ConfigBanner';
import InstagramModal from '../components/InstagramModal';

const studentNavItems = [
  { name: 'Dashboard', path: '/student', icon: LayoutDashboard, end: true },
  { name: 'My Marks', path: '/student/marks', icon: Award },
  { name: 'Activities', path: '/student/activities', icon: Calendar },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'My Profile', path: '/student/profile', icon: User },
  { name: 'Reset Password', path: '/student/reset-password', icon: KeyRound },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [instaModalOpen, setInstaModalOpen] = useState(false);
  const { user, profile, studentRecord, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const houseCode = studentRecord?.house?.code || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ConfigBanner />
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/student" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-eco-700 to-eco-500 flex items-center justify-center text-white shadow-md shadow-eco-600/20">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                  ECO CLUB
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-eco-100 text-eco-800">
                    Student
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">House Member Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Quick Card */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-gradient-to-br from-slate-50 to-eco-50/50 border border-slate-200/60 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                My House
              </span>
              {houseCode && <HouseBadge code={houseCode} size="sm" />}
            </div>
            <div className="font-bold text-slate-900 text-sm truncate">
              {studentRecord?.name || profile?.name || 'Student Member'}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Roll: {studentRecord?.roll_number || 'N/A'}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student Navigation
            </div>
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-eco-600 text-white shadow-sm shadow-eco-600/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Instagram Community Sidebar Box */}
          <div className="p-3 mx-4 my-2 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-600/10 border border-rose-200/60 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-2xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 leading-tight">Instagram</div>
                  <div className="text-[10px] font-mono text-slate-500 leading-none">@ecoclub_sxcce</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInstaModalOpen(true)}
                className="p-1 rounded-lg hover:bg-white/80 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                title="Scan QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
            <a
              href="https://www.instagram.com/ecoclub_sxcce?utm_source=qr&stkn=YnUwMnV2MTAzeGUy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-1.5 px-2 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-2xs transition flex items-center justify-center gap-1.5"
            >
              <span>Follow On Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="hidden sm:inline font-medium">Eco Club</span>
                <ChevronRight className="w-4 h-4 hidden sm:inline text-slate-400" />
                <span className="font-semibold text-slate-800">Student Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setInstaModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/70 transition cursor-pointer"
                title="Eco Club Instagram & QR Code"
              >
                <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <span className="hidden md:inline font-mono text-[11px]">@ecoclub_sxcce</span>
                <QrCode className="w-3.5 h-3.5 text-rose-600 hidden sm:inline" />
              </button>

              {houseCode && <HouseBadge code={houseCode} size="md" />}
              <Link
                to="/student/profile"
                className="w-8 h-8 rounded-full bg-eco-600 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:ring-2 hover:ring-eco-400 transition"
              >
                {studentRecord?.name?.charAt(0)?.toUpperCase() || profile?.name?.charAt(0)?.toUpperCase() || 'S'}
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <InstagramModal isOpen={instaModalOpen} onClose={() => setInstaModalOpen(false)} />
    </div>
  );
}
