import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Shield,
  Award,
  Trophy,
  TrendingUp,
  Percent,
  PlusCircle,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getAdminDashboardStats } from '../../services/api';
import HouseBadge, { HOUSE_COLORS } from '../../components/HouseBadge';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

const PIE_COLORS = ['#16a34a', '#2563eb', '#dc2626', '#ca8a04', '#9333ea', '#06b6d4', '#e11d48'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { error: toastError } = useToast();

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      toastError('Failed to fetch latest dashboard statistics from Supabase');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <CardSkeleton count={6} />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      link: '/admin/students',
    },
    {
      title: 'Active Students',
      value: stats?.activeStudents ?? 0,
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      link: '/admin/students',
    },
    {
      title: 'Total Activities',
      value: stats?.totalActivities ?? 0,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      link: '/admin/activities',
    },
    {
      title: 'Total Houses',
      value: stats?.totalHouses ?? 4,
      icon: Shield,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      link: '/admin/houses',
    },
    {
      title: 'Overall Participation',
      value: `${stats?.overallParticipationRate ?? 0}%`,
      icon: Percent,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      link: '/admin/marks',
    },
    {
      title: 'Current Top House',
      value: stats?.topHouse ? stats.topHouse.name.split(' ')[0] : 'None',
      sub: stats?.topHouse ? `${stats.topHouse.totalMarks} pts` : '',
      icon: Trophy,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      isHouse: true,
      houseCode: stats?.topHouse?.code,
      link: '/admin/rankings',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Overview Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time inter-house environmental metrics, student participation & scores
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <Link
            to="/admin/marks"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Enter Weekly Marks
          </Link>
        </div>
      </div>

      {/* DASHBOARD STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-eco-300 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-eco-600 transition" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">
                  {card.title}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{card.value}</span>
                  {card.houseCode && <HouseBadge code={card.houseCode} size="sm" />}
                </div>
                {card.sub && <div className="text-xs font-bold text-amber-600 mt-0.5">{card.sub}</div>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: House-wise Total Marks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">House-wise Total Marks</h2>
              <p className="text-xs text-slate-500">Cumulative points accumulated across all activities</p>
            </div>
            <Link to="/admin/rankings" className="text-xs text-eco-700 font-bold hover:underline">
              View Standings →
            </Link>
          </div>

          <div className="h-72 w-full">
            {stats?.houseMarksChart && stats.houseMarksChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.houseMarksChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val, name, item) => [`${val} points`, item.payload.fullName]}
                  />
                  <Bar dataKey="totalMarks" radius={[8, 8, 0, 0]}>
                    {stats.houseMarksChart.map((entry, index) => {
                      const color =
                        entry.code === 'GREEN' ? '#16a34a' :
                        entry.code === 'BLUE' ? '#2563eb' :
                        entry.code === 'RED' ? '#dc2626' :
                        entry.code === 'YELLOW' ? '#ca8a04' : '#16a34a';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No house marks logged yet
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Weekly Participation Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Activity Participation Trend</h2>
              <p className="text-xs text-slate-500">Student submissions and points over consecutive weeks</p>
            </div>
            <Link to="/admin/marks" className="text-xs text-eco-700 font-bold hover:underline">
              Enter Marks →
            </Link>
          </div>

          <div className="h-72 w-full">
            {stats?.weeklyTrendChart && stats.weeklyTrendChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyTrendChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="marks"
                    stroke="#16a34a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#marksGrad)"
                    name="Total Marks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Log weekly marks to see the participation trend curve
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: House Comparison & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* House Comparison Metric Bars */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">House Performance Comparison</h2>
              <p className="text-xs text-slate-500">Student count, marks average, and participation rates</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.housesRanked && stats.housesRanked.length > 0 ? (
              stats.housesRanked.map((house) => (
                <div key={house.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <HouseBadge code={house.code} size="md" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{house.name}</div>
                      <div className="text-xs text-slate-400">
                        {house.totalStudents} enrolled • {house.activeStudents} active
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase">Total Points</div>
                      <div className="text-base font-black text-slate-900">{house.totalMarks}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase">Avg / Student</div>
                      <div className="text-base font-bold text-slate-800">{house.averageMarks}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase">Turnout</div>
                      <div className="text-base font-bold text-eco-700">{house.participationRate}%</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">No house statistics available</div>
            )}
          </div>
        </div>

        {/* Department Distribution Pie */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Department Participation</h2>
            <p className="text-xs text-slate-500 mb-4">Student distribution by academic department</p>
          </div>

          <div className="h-56 w-full">
            {stats?.departmentChart && stats.departmentChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departmentChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.departmentChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Enroll students to view department ratios
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-center text-[11px] text-slate-600">
            {stats?.departmentChart?.slice(0, 4).map((d, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
