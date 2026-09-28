import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Calendar,
  Trophy,
  TrendingUp,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  User,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getStudentDashboardData } from '../../services/api';
import HouseBadge, { HOUSE_COLORS } from '../../components/HouseBadge';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import InstagramCommunityCard from '../../components/InstagramCommunityCard';

export default function StudentDashboard() {
  const { user, profile, studentRecord } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!studentRecord?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await getStudentDashboardData(studentRecord.id);
        setData(result);
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentRecord]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const studentName = studentRecord?.name || profile?.name || 'Student Member';
  const houseCode = studentRecord?.house?.code || null;
  const houseConfig = HOUSE_COLORS[houseCode] || { hex: '#16a34a' };

  return (
    <div className="space-y-8 pb-12">
      {/* WELCOME BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-eco-800 via-eco-700 to-emerald-600 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-xs">
              Eco Club Student Portal
            </span>
            {houseCode && <HouseBadge code={houseCode} size="sm" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {studentName}!
          </h1>
          <p className="mt-1 text-eco-100 text-xs sm:text-sm font-medium">
            Roll: <span className="font-mono font-bold text-white">{studentRecord?.roll_number || 'N/A'}</span> •{' '}
            {studentRecord?.department} ({studentRecord?.year})
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/student/marks"
            className="px-4 py-2.5 rounded-xl bg-white text-eco-900 font-bold text-xs hover:bg-eco-50 shadow-md transition"
          >
            View All My Marks
          </Link>
          <Link
            to="/leaderboard"
            className="px-4 py-2.5 rounded-xl bg-eco-900/60 border border-white/20 text-white font-bold text-xs hover:bg-eco-900 transition"
          >
            Championship
          </Link>
        </div>
      </div>

      {/* FIRST TIME PROFILE SETUP REMINDER BANNER */}
      {(!studentRecord?.email || studentRecord.email.includes('@ecoclub.org') || studentRecord.email.includes('@student.ecoclub.local') || !studentRecord?.phone) && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-950">
                First Time Setup: Add your Personal Gmail & Phone Number
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Link your active personal Gmail and mobile contact number to receive House competition alerts and awards.
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Update Contact Info</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Total Activities</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{data?.totalActivities ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Scheduled by Eco Club</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">My Participation</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {data?.activitiesParticipated ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Drives & Events Completed</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Total Marks</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{data?.totalMarks ?? 0} pts</div>
          <div className="text-[11px] text-slate-400 mt-1">Points for your house</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Average Mark</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">{data?.averageMarks ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Average score per activity</div>
        </div>
      </div>

      {/* INSTAGRAM COMMUNITY SHOWCASE */}
      <InstagramCommunityCard />

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Performance Trend</h2>
              <p className="text-xs text-slate-500">Marks earned week over week</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.weeklyPerformance && data.weeklyPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    formatter={(val, name, item) => [`${val} pts (${item.payload.activityName})`, 'Marks']}
                  />
                  <Line
                    type="monotone"
                    dataKey="marks"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ fill: '#16a34a', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Participate in Eco Club activities to see your performance chart!
              </div>
            )}
          </div>
        </div>

        {/* Activity Performance Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Activity Marks vs Max Mark</h2>
              <p className="text-xs text-slate-500">Your score across various eco drives</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.activityPerformance && data.activityPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activityPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="activity" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [`${val} marks`, name]}
                  />
                  <Bar dataKey="maxMarks" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Max Possible" />
                  <Bar dataKey="marks" fill="#16a34a" radius={[6, 6, 0, 0]} name="Marks Earned" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity marks logged yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MY HOUSE RANKING & OVERALL SCORES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My House Ranking Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">My House Standing</h2>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>

            <div className="text-center py-6 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
              <span className="text-xs uppercase font-extrabold text-slate-400">Inter-House Rank</span>
              <div className="text-4xl font-black text-slate-900 mt-1">
                {data?.myHouseRank ? `#${data.myHouseRank.rank}` : '—'}
              </div>
              <div className="mt-2">
                <HouseBadge code={houseCode} size="md" />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">House Name</span>
                <span className="font-bold text-slate-800">{data?.myHouseRank?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">House Total Score</span>
                <span className="font-black text-eco-700">{data?.myHouseRank?.totalMarks || 0} pts</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">House Participation</span>
                <span className="font-bold text-slate-800">{data?.myHouseRank?.participationRate || 0}%</span>
              </div>
            </div>
          </div>

          <Link
            to="/leaderboard"
            className="mt-6 w-full text-center py-2.5 bg-eco-50 hover:bg-eco-100 text-eco-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Overall House Scores Mini Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Overall House Scores</h2>
            <Link to="/leaderboard" className="text-xs text-eco-700 font-bold hover:underline">
              Live Standings →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.overallHouseScores?.map((h) => (
              <div key={h.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center">
                    #{h.rank}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                    <div className="text-xs text-slate-400">{h.totalStudents} Members</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">{h.totalMarks} pts</span>
                    <div className="text-[10px] text-slate-400">{h.participationRate}% participation</div>
                  </div>
                  <HouseBadge code={h.code} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
