import React, { useState, useEffect } from 'react';
import {
  Shield,
  Edit2,
  Users,
  Award,
  Trophy,
  Percent,
  X,
  Palette,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getHouseRankings, updateHouse } from '../../services/api';
import HouseBadge, { HOUSE_COLORS } from '../../components/HouseBadge';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function HousesPage() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingHouse, setEditingHouse] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '' });
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadHouses = async () => {
    try {
      setLoading(true);
      const data = await getHouseRankings();
      setHouses(data);
    } catch (err) {
      console.error('Error fetching houses:', err);
      toastError('Failed to load house data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHouses();
  }, []);

  const openEditModal = (house) => {
    setEditingHouse(house);
    setFormData({
      name: house.name,
      description: house.description || '',
      color: house.color || '#16a34a',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('House name cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await updateHouse(editingHouse.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
      });
      success(`Updated ${editingHouse.code} House successfully!`);
      setEditingHouse(null);
      loadHouses();
    } catch (err) {
      console.error('Error updating house:', err);
      toastError(err.message || 'Failed to update house details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Eco Club Houses Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review dynamic house standings, member tallies, and configure house identities
        </p>
      </div>

      {/* Houses Grid */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {houses.map((house) => {
            const config = HOUSE_COLORS[house.code] || {
              bg: 'bg-slate-50',
              border: 'border-slate-200',
              hex: '#16a34a',
            };

            const rankMedal = {
              1: '🥇 1st Place',
              2: '🥈 2nd Place',
              3: '🥉 3rd Place',
              4: '4th Place',
            }[house.rank] || `#${house.rank}`;

            return (
              <div
                key={house.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Badge & Edit Button */}
                  <div className="flex items-center justify-between mb-4">
                    <HouseBadge code={house.code} size="md" />
                    <button
                      onClick={() => openEditModal(house)}
                      className="p-1.5 text-slate-400 hover:text-eco-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Edit House Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* House Title & Description */}
                  <h3 className="text-lg font-black text-slate-900 mb-2">{house.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed min-h-[48px] line-clamp-3 mb-6">
                    {house.description || 'Dedicated to green campus impact and environmental awareness.'}
                  </p>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase">Current Standing</span>
                    <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {rankMedal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase">Student Count</span>
                    <span className="font-bold text-slate-800">{house.totalStudents} Members</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase">Total Points</span>
                    <span className="font-black text-base text-eco-700">{house.totalMarks} pts</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase">Average / Member</span>
                    <span className="font-bold text-slate-800">{house.averageMarks} pts</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase">Participation</span>
                    <span className="font-bold text-eco-800">{house.participationRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT HOUSE MODAL */}
      {editingHouse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-eco-100 text-eco-700">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Edit {editingHouse.code} House
                  </h3>
                  <p className="text-xs text-slate-500">Code cannot be changed to prevent duplicates</p>
                </div>
              </div>
              <button
                onClick={() => setEditingHouse(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  House Code (Immutable)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingHouse.code}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  House Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
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
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  placeholder="Environmental theme and mission..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Theme Color (Hex)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingHouse(null)}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-white bg-eco-600 hover:bg-eco-700 font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save House Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
