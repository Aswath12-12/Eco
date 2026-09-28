import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getHouseRankings, getWeeklyWinners } from '../../services/api';
import HouseBadge, { HOUSE_COLORS } from '../../components/HouseBadge';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [weeklyWinners, setWeeklyWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { error: toastError } = useToast();

  const loadRankings = async (triggerConfetti = false) => {
    try {
      setRefreshing(true);
      const [data, winnersData] = await Promise.all([
        getHouseRankings(),
        getWeeklyWinners(),
      ]);
      setRankings(data);
      setWeeklyWinners(winnersData);
      if (triggerConfetti && data.length > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#16a34a', '#2563eb', '#dc2626', '#ca8a04'],
        });
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
      toastError('Failed to calculate dynamic house rankings from Supabase');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRankings(true);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Dynamic Eco Championship Standings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inter-House Rankings & Leaderboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculated dynamically from points scored by each House team across all activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadRankings(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Recalculate Standings
          </button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          {/* PODIUM ROW - DYNAMIC TO CELEBRATE TIED 1ST PLACE / JOINT WINNERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {rankings.map((h) => {
              const isFirst = h.rank === 1;
              const isSecond = h.rank === 2;
              const isThird = h.rank === 3;

              return (
                <div
                  key={h.id}
                  className={`rounded-3xl p-6 border-2 transition duration-200 shadow-sm relative flex flex-col justify-between ${
                    isFirst
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/10 via-white to-white ring-4 ring-amber-400/20 shadow-xl transform hover:-translate-y-2'
                      : isSecond
                      ? 'border-slate-300 bg-white hover:-translate-y-1'
                      : isThird
                      ? 'border-amber-700/30 bg-white hover:-translate-y-1'
                      : 'border-slate-200 bg-white hover:-translate-y-1'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Crown className="w-6 h-6 animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div>
                    <div
                      className={`text-center pb-4 border-b ${
                        isFirst ? 'pt-2 border-amber-100' : 'border-slate-100'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs text-xl">
                        {isFirst ? (
                          <span className="text-2xl">🥇</span>
                        ) : isSecond ? (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black flex items-center justify-center text-base">
                            🥈
                          </div>
                        ) : isThird ? (
                          <div className="w-10 h-10 rounded-full bg-amber-800/10 border border-amber-700/30 text-amber-900 font-black flex items-center justify-center text-base">
                            🥉
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-black flex items-center justify-center text-xs">
                            #4
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          isFirst ? 'text-amber-800' : 'text-slate-400'
                        }`}
                      >
                        {isFirst
                          ? h.isJointWinner
                            ? 'Joint Winner (Tie) 🤝'
                            : '1st Place Champion 🏆'
                          : `${h.rank}${h.rank === 2 ? 'nd' : h.rank === 3 ? 'rd' : 'th'} Place`}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{h.name}</h3>
                      <div className="mt-2">
                        <HouseBadge code={h.code} size={isFirst ? 'lg' : 'md'} />
                      </div>
                    </div>

                    <div
                      className={`text-center py-3.5 rounded-2xl my-3 ${
                        isFirst
                          ? 'bg-amber-50/70 text-amber-950 font-black'
                          : 'bg-slate-50 text-slate-900'
                      }`}
                    >
                      <div className="text-3xl font-black">{h.totalMarks}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Total Team Points
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average Score</span>
                      <span className="font-bold text-slate-800">{h.averageMarks} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Activities Evaluated</span>
                      <span className="font-bold text-eco-700">{h.activitiesCount || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WEEKLY ROUND WINNERS & TIE ANNOUNCEMENT CAROUSEL / GRID */}
          {weeklyWinners.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Weekly Round Champions & Tie Announcements
                    </h3>
                    <p className="text-xs text-slate-500">
                      Teams with equal highest scores in any round are officially announced as Joint Winners
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {weeklyWinners.map((w) => (
                  <div
                    key={w.weekNumber}
                    className={`p-4 rounded-2xl border transition ${
                      w.isTie
                        ? 'border-amber-400 bg-gradient-to-b from-amber-50/70 to-white shadow-2xs'
                        : 'border-slate-200 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-black text-slate-700 border border-slate-200">
                        Week {w.weekNumber}
                      </span>
                      {w.isTie ? (
                        <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>Joint Winners (Tie) 🤝</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-eco-800 bg-eco-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>Round Winner 🏆</span>
                        </span>
                      )}
                    </div>

                    <div className="font-black text-slate-900 text-sm mt-1">
                      {w.winners.map((win) => win.house?.name).join(' & ')}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {w.winners.map((win) => (
                        <HouseBadge key={win.house_id} code={win.house?.code} size="xs" />
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span>Evaluation Score</span>
                      <span className="font-black text-eco-700">{w.maxMarks} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETAILED COMPARISON TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Complete Inter-House Performance Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Transparent ranking breakdown based strictly on cumulative points scored by each House
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">House Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 text-center">Activities Completed</th>
                    <th className="py-3 px-4 text-right">Average / Activity</th>
                    <th className="py-3 px-4 text-right font-black">Total Championship Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {rankings.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">
                        {h.rank === 1 && (h.isJointWinner ? '🥇 Joint 1st (Tie)' : '🥇 1st')}
                        {h.rank === 2 && (h.isTie ? '🥈 2nd (Tie)' : '🥈 2nd')}
                        {h.rank === 3 && (h.isTie ? '🥉 3rd (Tie)' : '🥉 3rd')}
                        {h.rank === 4 && '4th'}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">{h.name}</td>
                      <td className="py-4 px-4">
                        <HouseBadge code={h.code} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-center text-slate-700 font-semibold">
                        {h.activitiesCount || 0} activities
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-800">
                        {h.averageMarks} pts
                      </td>
                      <td className="py-4 px-4 text-right font-black text-base text-eco-700">
                        {h.totalMarks} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
