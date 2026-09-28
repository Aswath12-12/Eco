import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getWeeklyMarks } from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';

export default function StudentMarksPage() {
  const { studentRecord } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [weekFilter, setWeekFilter] = useState('');

  useEffect(() => {
    async function loadMarks() {
      if (!studentRecord?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getWeeklyMarks({
          studentId: studentRecord.id,
          weekNumber: weekFilter ? Number(weekFilter) : undefined,
        });
        setMarks(data);
      } catch (err) {
        console.error('Error fetching student marks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMarks();
  }, [studentRecord, weekFilter]);

  const filtered = marks.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.activity?.name?.toLowerCase().includes(q) ||
      m.remarks?.toLowerCase().includes(q)
    );
  });

  const totalPoints = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Participation Marks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Weekly scores, coordinator evaluations, and contribution to {studentRecord?.house?.name || 'House'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
            <span className="text-xs uppercase font-bold text-emerald-800 block">Total Earned</span>
            <span className="text-xl font-black text-emerald-900">{totalPoints} points</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by activity or remarks..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 bg-slate-50/50"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 text-xs"
            >
              <option value="">All Weeks</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No marks recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Once administrators evaluate your activity participation, your scores will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Week</th>
                  <th className="py-3 px-4">Activity Name</th>
                  <th className="py-3 px-4 text-center">Marks Earned</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4">Coordinator Remarks</th>
                  <th className="py-3 px-4 text-right">Award Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((m) => {
                  const maxMark = m.activity?.maximum_mark || 10;
                  const pct = Math.round((m.marks / maxMark) * 100);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                          Week {m.week_number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{m.activity?.name}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate">
                          {m.activity?.description || 'Campus environmental drive'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-sm text-eco-700">
                          {m.marks}{' '}
                          <span className="text-xs font-semibold text-slate-400">
                            / {maxMark}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-sm">
                        {m.remarks ? (
                          <div className="italic">"{m.remarks}"</div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-slate-500">
                        {new Date(m.created_at).toLocaleDateString()}
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
