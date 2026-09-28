import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Shield,
  Sparkles,
  Users,
  Calendar,
  Percent,
} from 'lucide-react';
import { getHouses, getHouseRankings, getHouseWeeklyMarks, getWeeklyWinners } from '../services/api';
import HouseBadge, { HOUSE_COLORS } from '../components/HouseBadge';
import { TableSkeleton } from '../components/LoadingSkeleton';

export default function LeaderboardPage() {
  const [houses, setHouses] = useState([]);
  const [houseRankings, setHouseRankings] = useState([]);
  const [activityMarks, setActivityMarks] = useState([]);
  const [weeklyWinners, setWeeklyWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [hList, hRankings, marksData, winnersData] = await Promise.all([
        getHouses().catch(() => []),
        getHouseRankings().catch(() => []),
        getHouseWeeklyMarks({
          houseId: selectedHouse || undefined,
          weekNumber: selectedWeek ? Number(selectedWeek) : undefined,
        }).catch(() => []),
        getWeeklyWinners().catch(() => []),
      ]);
      setHouses(hList);
      setHouseRankings(hRankings);
      setActivityMarks(marksData);
      setWeeklyWinners(winnersData);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHouse, selectedWeek]);

  // Client-side search filtering
  const filteredActivities = useMemo(() => {
    if (!search.trim()) return activityMarks;
    const q = search.toLowerCase();
    return activityMarks.filter(
      (m) =>
        m.activity?.name?.toLowerCase().includes(q) ||
        m.house?.name?.toLowerCase().includes(q) ||
        m.remarks?.toLowerCase().includes(q)
    );
  }, [activityMarks, search]);

  // Active weekly winner announcement
  const activeWinnerInfo = useMemo(() => {
    if (selectedWeek) {
      return weeklyWinners.find((w) => w.weekNumber === Number(selectedWeek)) || null;
    }
    return weeklyWinners[0] || null; // Latest completed week
  }, [weeklyWinners, selectedWeek]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-bold mb-3">
          <Trophy className="w-4 h-4 text-amber-500" />
          Eco Club Championship Standings
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Inter-House Championship Leaderboard
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base">
          Tracking official House points, weekly champions, and tied winners across all campus eco drives.
        </p>
      </div>

      {/* WEEKLY WINNERS & TIE ANNOUNCEMENT BANNER */}
      {activeWinnerInfo && (
        <div className="rounded-3xl p-6 sm:p-7 border-2 border-amber-400 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 shrink-0">
              {activeWinnerInfo.isTie ? '🤝' : '🏆'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-950 font-black text-xs uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {activeWinnerInfo.isTie
                    ? `Week ${activeWinnerInfo.weekNumber} Official Result: Joint Winners (Tie)!`
                    : `Week ${activeWinnerInfo.weekNumber} Official Winner!`}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeWinnerInfo.isTie
                  ? `${activeWinnerInfo.winners.map((w) => w.house?.name).join(' & ')} Both Win Week ${activeWinnerInfo.weekNumber}!`
                  : `${activeWinnerInfo.winners[0]?.house?.name} Wins Week ${activeWinnerInfo.weekNumber}!`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 mt-1">
                {activeWinnerInfo.isTie
                  ? `Both houses tied with identical top evaluation score of ${activeWinnerInfo.maxMarks} points in Week ${activeWinnerInfo.weekNumber} — both are officially announced as winners!`
                  : `Achieved the highest score of ${activeWinnerInfo.maxMarks} points in Week ${activeWinnerInfo.weekNumber} environmental evaluations.`}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {activeWinnerInfo.winners.map((w) => (
              <div
                key={w.house_id}
                className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border-2 border-amber-300 shadow-sm"
              >
                <HouseBadge code={w.house?.code} size="md" />
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900">{w.house?.name}</div>
                  <div className="text-[10px] font-extrabold text-amber-600 uppercase">
                    {activeWinnerInfo.isTie ? 'Joint Winner 🤝' : 'Week Champion 🏆'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOUSE PODIUM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {houseRankings.map((h) => {
          const isFirst = h.rank === 1;
          const podiumBorder = isFirst
            ? 'border-amber-400 bg-gradient-to-b from-amber-50/70 to-white ring-2 ring-amber-400/20'
            : h.rank === 2
            ? 'border-slate-300 bg-gradient-to-b from-slate-50 to-white'
            : h.rank === 3
            ? 'border-amber-700/30 bg-gradient-to-b from-orange-50/50 to-white'
            : 'border-slate-200 bg-white';

          const crownColor = isFirst
            ? 'text-amber-500'
            : h.rank === 2
            ? 'text-slate-400'
            : h.rank === 3
            ? 'text-amber-700'
            : 'text-slate-300';

          return (
            <div
              key={h.id}
              className={`rounded-2xl p-5 border shadow-xs transition transform hover:-translate-y-0.5 ${podiumBorder}`}
            >
              <div className="flex items-center justify-between mb-3">
                <HouseBadge code={h.code} size="md" />
                <div className="flex items-center gap-1 font-black text-sm">
                  <Trophy className={`w-4 h-4 ${crownColor}`} />
                  <span>
                    #{h.rank}
                    {h.isJointWinner && (
                      <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                        Tie 🤝
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-base truncate mb-1">{h.name}</h3>
              <div className="text-2xl font-black text-slate-900 mb-3">
                {h.totalMarks}{' '}
                <span className="text-xs font-semibold text-slate-500 uppercase">pts</span>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px] font-bold uppercase">Avg / Activity</span>
                  <span className="font-bold text-slate-700">{h.averageMarks} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px] font-bold uppercase">Activities</span>
                  <span className="font-bold text-slate-700">{h.activitiesCount || 0} evaluated</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTER-HOUSE ACTIVITY BREAKDOWN & TURNOUT TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-eco-600" />
              Inter-House Activity Evaluations & Points
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Weekly scores and evaluation points awarded to each House team
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by activity or remarks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-100 text-xs">
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

        {/* House Activity Table */}
        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No house activity evaluations logged yet</p>
              <p className="text-xs text-slate-400 mt-1">
                House marks and points will appear here once administrators record weekly scores.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 w-24">Week</th>
                  <th className="py-3.5 px-4">House Evaluated</th>
                  <th className="py-3.5 px-4">Activity Name</th>
                  <th className="py-3.5 px-4 text-center">Points Awarded</th>
                  <th className="py-3.5 px-4">Coordinator Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredActivities.map((m) => {
                  const maxMark = m.activity?.maximum_mark || 10;
                  const pct = Math.round((m.marks / maxMark) * 100);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-800 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                          Week {m.week_number}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <HouseBadge code={m.house?.code} size="sm" />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{m.house?.name}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{m.house?.code} HOUSE</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {m.activity?.name}
                        </div>
                        {m.activity?.activity_date && (
                          <div className="text-[11px] text-slate-400">
                            {new Date(m.activity.activity_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-sm text-eco-700">
                          {m.marks}{' '}
                          <span className="text-xs font-semibold text-slate-400">
                            / {maxMark}
                          </span>
                        </span>
                        <div className="text-[10px] text-slate-400 font-semibold">{pct}%</div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {m.remarks || '—'}
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
