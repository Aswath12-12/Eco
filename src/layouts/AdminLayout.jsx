import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  Award,
  Trophy,
  FileSpreadsheet,
  User,
  LogOut,
  Menu,
  X,
  Leaf,
  UploadCloud,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfigBanner from '../components/ConfigBanner';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Students', path: '/admin/students', icon: Users },
  { name: 'Bulk Import', path: '/admin/students/import', icon: UploadCloud },
  { name: 'Houses', path: '/admin/houses', icon: Shield },
  { name: 'Activities', path: '/admin/activities', icon: Calendar },
  { name: 'Weekly Marks', path: '/admin/marks', icon: Award },
  { name: 'House Rankings', path: '/admin/rankings', icon: Trophy },
  { name: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
  { name: 'Admin Profile', path: '/admin/profile', icon: User },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

        {/* Desktop and Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand header */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-eco-700 to-eco-500 flex items-center justify-center text-white shadow-md shadow-eco-600/20">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                  ECO CLUB
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-eco-100 text-eco-800">
                    Admin
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">Management Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management Menu
            </div>
            {navItems.map((item) => {
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

            <div className="pt-4 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-4">
              Public Portal
            </div>
            <Link
              to="/leaderboard"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Live Leaderboard</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </nav>

          {/* Admin User Card & Sign Out */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-eco-100 text-eco-800 font-bold flex items-center justify-center text-sm border border-eco-200">
                {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {profile?.name || 'Administrator'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@ecoclub.org'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
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
                <span className="hidden sm:inline font-medium">Eco Club Portal</span>
                <ChevronRight className="w-4 h-4 hidden sm:inline text-slate-400" />
                <span className="font-semibold text-slate-800">Admin Control</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-eco-700 bg-eco-50 hover:bg-eco-100 px-3 py-1.5 rounded-lg border border-eco-200 transition"
              >
                <Leaf className="w-3.5 h-3.5" /> View Public Site
              </Link>
              <div className="w-8 h-8 rounded-full bg-eco-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
