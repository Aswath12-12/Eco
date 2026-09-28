import React, { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  Award,
  Search,
  X,
  AlertCircle,
  Sparkles,
  TreePine,
  CheckCircle2,
} from 'lucide-react';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    activity_date: new Date().toISOString().split('T')[0],
    maximum_mark: 10,
  });
  const [formError, setFormError] = useState('');

  const { success, error: toastError } = useToast();

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      toastError('Failed to load activities from Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const openAddModal = () => {
    setSelectedActivity(null);
    setFormData({
      name: '',
      description: '',
      activity_date: new Date().toISOString().split('T')[0],
      maximum_mark: 10,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (activity) => {
    setSelectedActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || '',
      activity_date: activity.activity_date || new Date().toISOString().split('T')[0],
      maximum_mark: activity.maximum_mark || 10,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (activity) => {
    setSelectedActivity(activity);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Activity name is required');
      return;
    }
    if (Number(formData.maximum_mark) <= 0) {
      setFormError('Maximum mark must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      if (selectedActivity) {
        await updateActivity(selectedActivity.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          activity_date: formData.activity_date,
          maximum_mark: Number(formData.maximum_mark),
        });
        success(`Activity "${formData.name}" updated successfully!`);
      } else {
        await createActivity({
          name: formData.name.trim(),
          description: formData.description.trim(),
          activity_date: formData.activity_date,
          maximum_mark: Number(formData.maximum_mark),
        });
        success(`New activity "${formData.name}" created!`);
      }
      setIsModalOpen(false);
      loadActivities();
    } catch (err) {
      console.error('Error saving activity:', err);
      setFormError(err.message || 'Failed to save activity');
      toastError(err.message || 'Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedActivity) return;
    try {
      setSubmitting(true);
      await deleteActivity(selectedActivity.id);
      success(`Activity "${selectedActivity.name}" removed.`);
      setIsDeleteModalOpen(false);
      loadActivities();
    } catch (err) {
      console.error('Error deleting activity:', err);
      toastError(err.message || 'Failed to delete activity');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = activities.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Eco Club Activities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule environmental drives, campaigns, workshops, and manage maximum marks
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-xl shadow-xs transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule New Activity
        </button>
      </div>

      {/* Activities Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 bg-slate-50/50"
            />
          </div>
          <span className="text-xs font-bold text-slate-400 hidden sm:block">
            {filtered.length} Activities Listed
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No activities scheduled yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Add an activity like "Tree Plantation" or "Campus Cleaning" to get started.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Activity Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Maximum Marks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{activity.name}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-xs text-slate-500 truncate">
                      {activity.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                      {new Date(activity.activity_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Award className="w-3 h-3 text-amber-600" />
                        {activity.maximum_mark} pts
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="p-1.5 text-slate-400 hover:text-eco-600 hover:bg-eco-50 rounded-lg transition"
                          title="Edit Activity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(activity)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-eco-100 text-eco-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedActivity ? 'Edit Activity' : 'Schedule New Activity'}
                  </h3>
                  <p className="text-xs text-slate-500">Eco Club participation initiative</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
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
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tree Plantation Drive"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-hidden focus:border-eco-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Goals, location, instructions for participants..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-eco-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Activity Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maximum Mark
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.maximum_mark}
                    onChange={(e) => setFormData({ ...formData, maximum_mark: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-white bg-eco-600 hover:bg-eco-700 font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : selectedActivity ? 'Update Activity' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Activity"
        message={`Are you sure you want to delete "${selectedActivity?.name}"? Any weekly marks awarded under this activity will also be removed.`}
        confirmText="Delete Activity"
        isDanger={true}
        loading={submitting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
