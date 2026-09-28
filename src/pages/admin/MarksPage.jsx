import React, { useState, useEffect } from 'react';
import {
  Award,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Calendar,
  Users,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  getHouseWeeklyMarks,
  getActivities,
  getHouses,
  upsertHouseWeeklyMarks,
  deleteHouseWeeklyMarks,
} from '../../services/api';
import HouseBadge, { HOUSE_COLORS } from '../../components/HouseBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function MarksPage() {
  const [houseMarksList, setHouseMarksList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState('');
  const [search, setSearch] = useState('');

  // Entry Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields - House-centric
  const [formWeek, setFormWeek] = useState(1);
  const [formActivityId, setFormActivityId] = useState('');
  const [formHouseId, setFormHouseId] = useState('');
  const [formMarks, setFormMarks] = useState(8);
  const [formRemarks, setFormRemarks] = useState('');
  const [formError, setFormError] = useState('');

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [marksData, actData, houseData] = await Promise.all([
        getHouseWeeklyMarks({
          weekNumber: selectedWeekFilter ? Number(selectedWeekFilter) : undefined,
          activityId: selectedActivityFilter || undefined,
          houseId: selectedHouseFilter || undefined,
        }),
        getActivities(),
        getHouses(),
      ]);

      setHouseMarksList(marksData);
      setActivities(actData);
      setHouses(houseData);

      if (actData.length > 0 && !formActivityId) {
        setFormActivityId(actData[0].id);
      }
      if (houseData.length > 0 && !formHouseId) {
        setFormHouseId(houseData[0].id);
      }
    } catch (err) {
      console.error('Error loading marks data:', err);
      toastError('Failed to load house marks from Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWeekFilter, selectedActivityFilter, selectedHouseFilter]);

  // Selected activity object to know max mark
  const currentActivity = activities.find((a) => a.id === formActivityId) || activities[0] || null;
  const maxMarkAllowed = currentActivity?.maximum_mark || 10;

  const openAddModal = () => {
    setEditingMark(null);
    setFormWeek(1);
    const defAct = activities[0]?.id || '';
    const defHouse = houses[0]?.id || '';
    setFormActivityId(defAct);
    setFormHouseId(defHouse);
    setFormMarks(8);
    setFormRemarks('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (mark) => {
    setEditingMark(mark);
    setFormWeek(mark.week_number);
    setFormActivityId(mark.activity_id);
    setFormHouseId(mark.house_id);
    setFormMarks(mark.marks);
    setFormRemarks(mark.remarks || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (mark) => {
    setEditingMark(mark);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formHouseId) {
      setFormError('Please select a House');
      return;
    }
    if (!formActivityId) {
      setFormError('Please select an Activity');
      return;
    }

    const marksNum = Number(formMarks);
    if (isNaN(marksNum) || marksNum < 0) {
      setFormError('Marks must be 0 or a positive number');
      return;
    }
    if (marksNum > maxMarkAllowed) {
      setFormError(`Marks cannot exceed the activity maximum mark of ${maxMarkAllowed}`);
      return;
    }

    try {
      setSubmitting(true);
      await upsertHouseWeeklyMarks({
        houseId: formHouseId,
        activityId: formActivityId,
        weekNumber: Number(formWeek),
        marks: marksNum,
        remarks: formRemarks.trim() || null,
      });

      const targetHouse = houses.find((h) => h.id === formHouseId);
      const houseName = targetHouse?.name?.split(' ')[0] || targetHouse?.code || 'House';
      success(`Successfully awarded ${marksNum} points to ${houseName} House!`);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving house marks:', err);
      const msg = err.message || 'Failed to save house marks';
      setFormError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingMark) return;
    try {
      setSubmitting(true);
      await deleteHouseWeeklyMarks({
        houseId: editingMark.house_id,
        activityId: editingMark.activity_id,
        weekNumber: editingMark.week_number,
      });
      success('House marks entry deleted successfully.');
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error deleting house mark:', err);
      toastError(err.message || 'Failed to delete mark');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMarks = houseMarksList.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.house?.name?.toLowerCase().includes(q) ||
      m.house?.code?.toLowerCase().includes(q) ||
      m.activity?.name?.toLowerCase().includes(q) ||
      m.remarks?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-100 text-eco-800 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-eco-600" />
            Inter-House Competition Marks
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            House Marks Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Award and manage weekly environmental activity points directly for each House
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-xl shadow-md shadow-eco-600/20 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Award House Marks</span>
        </button>
      </div>

      {/* House Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {houses.map((h) => {
          const marksForHouse = houseMarksList.filter((m) => m.house_id === h.id);
          const totalPts = marksForHouse.reduce((acc, m) => acc + (Number(m.marks) || 0), 0);

          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <HouseBadge code={h.code} size="sm" />
                <span className="text-xs font-black text-slate-900">{totalPts} pts</span>
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 truncate">{h.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{marksForHouse.length} Activities Evaluated</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="w-full lg:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by house, activity, or remarks..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <select
              value={selectedWeekFilter}
              onChange={(e) => setSelectedWeekFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Weeks</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>

            <select
              value={selectedActivityFilter}
              onChange={(e) => setSelectedActivityFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Activities</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <select
              value={selectedHouseFilter}
              onChange={(e) => setSelectedHouseFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Houses</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredMarks.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No house weekly marks logged yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click "Award House Marks" above to assign points directly to a House for completed environmental activities.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Week</th>
                  <th className="py-3 px-4">House Evaluated</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-center">Points Awarded</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMarks.map((m) => {
                  const maxMark = m.activity?.maximum_mark || 10;
                  const pct = Math.round((m.marks / maxMark) * 100);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                          Week {m.week_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <HouseBadge code={m.house?.code} size="sm" />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{m.house?.name}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{m.house?.code} HOUSE</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {m.activity?.name}
                        </div>
                        {m.activity?.activity_date && (
                          <div className="text-[11px] text-slate-400">
                            {new Date(m.activity.activity_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-sm text-eco-700">
                          {m.marks}{' '}
                          <span className="text-xs font-semibold text-slate-400">
                            / {maxMark}
                          </span>
                        </span>
                        <div className="text-[10px] text-slate-400 font-semibold">{pct}%</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {m.remarks || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 text-slate-400 hover:text-eco-600 hover:bg-eco-50 rounded-lg transition cursor-pointer"
                            title="Edit House Mark"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(m)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete House Mark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ENTER / EDIT HOUSE MARKS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-eco-100 text-eco-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingMark ? 'Edit House Weekly Marks' : 'Award House Weekly Marks'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Marks will be credited to present members and added to the house standing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Select House (Visual Selector) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select House *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {houses.map((h) => {
                    const isSelected = formHouseId === h.id;
                    return (
                      <button
                        type="button"
                        key={h.id}
                        disabled={Boolean(editingMark)}
                        onClick={() => setFormHouseId(h.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed ${
                          isSelected
                            ? 'border-eco-600 bg-eco-50/70 ring-2 ring-eco-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <HouseBadge code={h.code} size="sm" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate">
                            {h.name}
                          </div>
                          <div className="text-[10px] text-slate-500">{h.code} House</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Week & Activity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Week Number */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Week Number *
                  </label>
                  <select
                    disabled={Boolean(editingMark)}
                    value={formWeek}
                    onChange={(e) => setFormWeek(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white disabled:bg-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity Selector */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Activity *
                  </label>
                  <select
                    disabled={Boolean(editingMark)}
                    value={formActivityId}
                    onChange={(e) => setFormActivityId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white disabled:bg-slate-100 truncate"
                  >
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Max {a.maximum_mark} pts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Marks Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    House Marks Awarded *
                  </label>
                  <span className="text-[11px] font-bold text-eco-700">
                    Max Allowed: {maxMarkAllowed} Marks
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={maxMarkAllowed}
                  required
                  value={formMarks}
                  onChange={(e) => setFormMarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-lg font-black text-slate-900 focus:outline-hidden focus:border-eco-600"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Evaluation Remarks / Feedback
                </label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="e.g. Outstanding team effort and creative presentation in campus eco drive"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-eco-600"
                />
              </div>

              {/* Information callout */}
              <div className="p-3 rounded-2xl bg-eco-50/80 border border-eco-200/70 text-eco-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-eco-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Direct Team Points:</strong> Points awarded here are credited directly to the selected House's overall championship tally and immediately reflect across all live leaderboards and standings.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingMark ? 'Update House Marks' : 'Award House Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete House Marks Entry"
        message={`Are you sure you want to delete Week ${editingMark?.week_number} marks for ${editingMark?.house?.name}? This house activity evaluation will be permanently removed.`}
        confirmText="Delete Marks"
        isDanger={true}
        loading={submitting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
