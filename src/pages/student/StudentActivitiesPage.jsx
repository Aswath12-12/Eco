import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getActivities, getWeeklyMarks } from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';

export default function StudentActivitiesPage() {
  const { studentRecord } = useAuth();
  const [activities, setActivities] = useState([]);
  const [myMarks, setMyMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [actList, marksList] = await Promise.all([
          getActivities(),
          studentRecord?.id ? getWeeklyMarks({ studentId: studentRecord.id }) : [],
        ]);
        setActivities(actList);
        setMyMarks(marksList);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentRecord]);

  // Create a map of activity_id -> mark object
  const marksMap = {};
  myMarks.forEach((m) => {
    marksMap[m.activity_id] = m;
  });

  const filtered = activities.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Eco Club Environmental Drives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse campus initiatives, scheduled workshops, and check your participation records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs">
            {myMarks.length} / {activities.length} Completed
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:w-80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search initiatives..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 bg-white shadow-xs"
        />
      </div>

      {/* Activities Grid */}
      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200/80 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No activities found</p>
          <p className="text-xs text-slate-400 mt-1">Check back soon for upcoming campus drives.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((activity) => {
            const userMark = marksMap[activity.id];
            const hasParticipated = Boolean(userMark);

            return (
              <div
                key={activity.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-eco-600" />
                      {new Date(activity.activity_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                      Max: {activity.maximum_mark} pts
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{activity.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed min-h-[48px] line-clamp-3 mb-6">
                    {activity.description || 'Hands-on environmental stewardship initiative.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {hasParticipated ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed (Week {userMark.week_number})</span>
                      </div>
                      <span className="font-black text-sm text-eco-700">
                        {userMark.marks} / {activity.maximum_mark} pts
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Not Recorded</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Available</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
