import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Users,
  Percent,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getHouseRankings } from '../../services/api';
import HouseBadge, { HOUSE_COLORS } from '../../components/HouseBadge';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { error: toastError } = useToast();

  const loadRankings = async (triggerConfetti = false) => {
    try {
      setRefreshing(true);
      const data = await getHouseRankings();
      setRankings(data);
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

  const firstPlace = rankings[0];
  const secondPlace = rankings[1];
  const thirdPlace = rankings[2];
  const fourthPlace = rankings[3];

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
            Calculated dynamically from live student counts, weekly marks, and turnouts
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
          {/* PODIUM ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* 2nd Place */}
            {secondPlace && (
              <div className="order-2 md:order-1 bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-sm relative flex flex-col justify-between transform hover:-translate-y-1 transition duration-200">
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 font-black text-xl flex items-center justify-center mx-auto mb-3 border border-slate-300 shadow-xs">
                    🥈
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    2nd Place
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{secondPlace.name}</h3>
                  <div className="mt-2">
                    <HouseBadge code={secondPlace.code} size="md" />
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Points</span>
                    <span className="font-extrabold text-slate-900 text-sm">{secondPlace.totalMarks} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Students</span>
                    <span className="font-bold text-slate-700">{secondPlace.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Score</span>
                    <span className="font-bold text-slate-700">{secondPlace.averageMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Turnout Rate</span>
                    <span className="font-bold text-eco-700">{secondPlace.participationRate}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place - Champion */}
            {firstPlace && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white rounded-3xl p-7 border-2 border-amber-400 shadow-xl relative flex flex-col justify-between transform hover:-translate-y-2 transition duration-200 ring-4 ring-amber-400/20 md:-mb-2">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Crown className="w-6 h-6 animate-bounce" />
                  </div>
                </div>

                <div className="text-center pt-3 pb-4 border-b border-amber-100">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-800">
                    Current Leader
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{firstPlace.name}</h3>
                  <div className="mt-2">
                    <HouseBadge code={firstPlace.code} size="lg" />
                  </div>
                </div>

                <div className="text-center py-4 bg-amber-50/60 rounded-2xl my-3">
                  <div className="text-3xl font-black text-amber-900">{firstPlace.totalMarks}</div>
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    Total House Points
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Students</span>
                    <span className="font-black text-slate-800">{firstPlace.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Average Score</span>
                    <span className="font-black text-slate-800">{firstPlace.averageMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Participation</span>
                    <span className="font-black text-eco-700">{firstPlace.participationRate}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <div className="order-3 md:order-3 bg-white rounded-3xl p-6 border-2 border-amber-700/30 shadow-sm relative flex flex-col justify-between transform hover:-translate-y-1 transition duration-200">
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-amber-800/10 text-amber-900 font-black text-xl flex items-center justify-center mx-auto mb-3 border border-amber-700/30 shadow-xs">
                    🥉
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                    3rd Place
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{thirdPlace.name}</h3>
                  <div className="mt-2">
                    <HouseBadge code={thirdPlace.code} size="md" />
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Points</span>
                    <span className="font-extrabold text-slate-900 text-sm">{thirdPlace.totalMarks} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Students</span>
                    <span className="font-bold text-slate-700">{thirdPlace.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Score</span>
                    <span className="font-bold text-slate-700">{thirdPlace.averageMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Turnout Rate</span>
                    <span className="font-bold text-eco-700">{thirdPlace.participationRate}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4th Place */}
            {fourthPlace && (
              <div className="order-4 md:order-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative flex flex-col justify-between transform hover:-translate-y-1 transition duration-200">
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-black text-base flex items-center justify-center mx-auto mb-3 border border-slate-200">
                    #4
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    4th Place
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{fourthPlace.name}</h3>
                  <div className="mt-2">
                    <HouseBadge code={fourthPlace.code} size="md" />
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Points</span>
                    <span className="font-extrabold text-slate-900 text-sm">{fourthPlace.totalMarks} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Students</span>
                    <span className="font-bold text-slate-700">{fourthPlace.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Score</span>
                    <span className="font-bold text-slate-700">{fourthPlace.averageMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Turnout Rate</span>
                    <span className="font-bold text-eco-700">{fourthPlace.participationRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DETAILED COMPARISON TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Complete Inter-House Performance Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Transparent ranking breakdown powered strictly by database tallies
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">House Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 text-center">Total Students</th>
                    <th className="py-3 px-4 text-center">Active Members</th>
                    <th className="py-3 px-4 text-center">Participation %</th>
                    <th className="py-3 px-4 text-right">Average / Student</th>
                    <th className="py-3 px-4 text-right font-black">Total Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {rankings.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">
                        {h.rank === 1 && '🥇 1st'}
                        {h.rank === 2 && '🥈 2nd'}
                        {h.rank === 3 && '🥉 3rd'}
                        {h.rank === 4 && '4th'}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">{h.name}</td>
                      <td className="py-4 px-4">
                        <HouseBadge code={h.code} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-center">{h.totalStudents}</td>
                      <td className="py-4 px-4 text-center text-emerald-700 font-bold">{h.activeStudents}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-eco-50 text-eco-800">
                          {h.participationRate}%
                        </span>
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
