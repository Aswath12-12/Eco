import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Shield,
  RotateCcw,
  Sparkles,
  ChevronDown,
  User,
} from 'lucide-react';
import { getHouses, getLeaderboardData, getHouseRankings } from '../services/api';
import HouseBadge from '../components/HouseBadge';
import { TableSkeleton } from '../components/LoadingSkeleton';

export default function LeaderboardPage() {
  const [houses, setHouses] = useState([]);
  const [houseRankings, setHouseRankings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [hList, hRankings, lbData] = await Promise.all([
        getHouses().catch(() => []),
        getHouseRankings().catch(() => []),
        getLeaderboardData({
          houseId: selectedHouse,
          department: selectedDept,
          year: selectedYear,
          weekNumber: selectedWeek ? Number(selectedWeek) : null,
        }).catch(() => []),
      ]);
      setHouses(hList);
      setHouseRankings(hRankings);
      setLeaderboard(lbData);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHouse, selectedDept, selectedYear, selectedWeek]);

  // Client-side search filtering
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return leaderboard;
    const q = search.toLowerCase();
    return leaderboard.filter(
      (st) =>
        st.name?.toLowerCase().includes(q) ||
        st.roll_number?.toLowerCase().includes(q) ||
        st.department?.toLowerCase().includes(q)
    );
  }, [leaderboard, search]);

  const topThree = leaderboard.slice(0, 3);

  // Available departments & years for dropdowns
  const departments = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Biotech', 'Electronics', 'Chemical', 'Information Tech'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-bold mb-3">
          <Trophy className="w-4 h-4 text-amber-500" />
          Eco Club Championship Standings
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          House & Student Leaderboard
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base">
          Celebrating top-performing environmentalists and tracking inter-house green points in real-time.
        </p>
      </div>

      {/* HOUSE PODIUM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {houseRankings.map((h) => {
          const podiumBorder = {
            1: 'border-amber-400 bg-gradient-to-b from-amber-50/70 to-white ring-2 ring-amber-400/20',
            2: 'border-slate-300 bg-gradient-to-b from-slate-50 to-white',
            3: 'border-amber-700/30 bg-gradient-to-b from-orange-50/50 to-white',
            4: 'border-slate-200 bg-white',
          }[h.rank] || 'border-slate-200 bg-white';

          const crownColor = {
            1: 'text-amber-500',
            2: 'text-slate-400',
            3: 'text-amber-700',
            4: 'text-slate-300',
          }[h.rank];

          return (
            <div
              key={h.id}
              className={`rounded-2xl p-5 border shadow-xs transition transform hover:-translate-y-0.5 ${podiumBorder}`}
            >
              <div className="flex items-center justify-between mb-3">
                <HouseBadge code={h.code} size="md" />
                <div className="flex items-center gap-1 font-black text-sm">
                  <Trophy className={`w-4 h-4 ${crownColor}`} />
                  <span>#{h.rank}</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-base truncate mb-1">{h.name}</h3>
              <div className="text-2xl font-black text-slate-900 mb-3">
                {h.totalMarks}{' '}
                <span className="text-xs font-semibold text-slate-500 uppercase">pts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Students</span>
                  <span className="font-bold text-slate-700">{h.totalStudents}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Marks</span>
                  <span className="font-bold text-slate-700">{h.averageMarks}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STUDENT LEADERBOARD SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Medal className="w-6 h-6 text-eco-600" />
              Student Individual Rankings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top participating students based on weekly activities and performance marks
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student or roll no..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by House
            </label>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-eco-500"
            >
              <option value="">All Houses</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-eco-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Year of Study
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-eco-500"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Week Filter
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-eco-500"
            >
              <option value="">All Weeks Combined</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No student records found</p>
              <p className="text-xs text-slate-400 mt-1">
                Students and marks will appear here once administrators log activities and scores.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">House</th>
                  <th className="py-3.5 px-4">Department & Year</th>
                  <th className="py-3.5 px-4 text-center">Activities</th>
                  <th className="py-3.5 px-4 text-right">Total Marks</th>
                  <th className="py-3.5 px-4 text-right">Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((st) => {
                  const isGold = st.rank === 1;
                  const isSilver = st.rank === 2;
                  const isBronze = st.rank === 3;

                  let rankBadge = (
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center text-xs">
                      #{st.rank}
                    </span>
                  );

                  if (isGold) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-black inline-flex items-center justify-center text-xs shadow-xs">
                        🥇 1
                      </span>
                    );
                  } else if (isSilver) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 border border-slate-300 font-black inline-flex items-center justify-center text-xs shadow-xs">
                        🥈 2
                      </span>
                    );
                  } else if (isBronze) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-amber-800/10 text-amber-900 border border-amber-700/30 font-black inline-flex items-center justify-center text-xs shadow-xs">
                        🥉 3
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isGold ? 'bg-amber-50/30 font-semibold' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">{rankBadge}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                        <div className="text-xs font-mono text-slate-400">{st.roll_number}</div>
                      </td>
                      <td className="py-4 px-4">
                        <HouseBadge code={st.house?.code} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-800 font-medium">{st.department}</div>
                        <div className="text-[11px] text-slate-400">{st.year}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {st.activitiesCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-base font-extrabold text-eco-700">
                          {st.totalMarks}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">pts</span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-800">
                        {st.averageMarks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
