import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  UploadCloud,
  X,
  Phone,
  Mail,
  GraduationCap,
  Building,
  Shield,
  CheckCircle,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import {
  getStudents,
  getHouses,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUpdateStudentHouse,
  bulkDeleteStudents,
} from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Multiple Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkHouseModalOpen, setIsBulkHouseModalOpen] = useState(false);
  const [bulkTargetHouseId, setBulkTargetHouseId] = useState('');
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    department: 'Computer Science',
    year: '1st Year',
    phone: '',
    house_id: '',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState('');

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, housesData] = await Promise.all([
        getStudents({
          houseId: houseFilter,
          department: deptFilter,
          year: yearFilter,
          status: statusFilter,
        }),
        getHouses(),
      ]);
      setStudents(studentsData);
      setHouses(housesData);
    } catch (err) {
      console.error('Error fetching students:', err);
      toastError('Failed to load students list from Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Clear selection when filters change
    setSelectedIds([]);
  }, [houseFilter, deptFilter, yearFilter, statusFilter]);

  // Client search filter
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.roll_number?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
    );
  }, [students, search]);

  // Multiple selection helpers
  const isAllSelected =
    filteredStudents.length > 0 && selectedIds.length === filteredStudents.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < filteredStudents.length;

  const toggleSelectAll = () => {
    if (filteredStudents.length === 0) return;
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openAddModal = () => {
    setSelectedStudent(null);
    setFormData({
      name: '',
      roll_number: '',
      email: '',
      department: 'Computer Science',
      year: '1st Year',
      phone: '',
      house_id: houses[0]?.id || '',
      status: 'ACTIVE',
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      roll_number: student.roll_number || '',
      email: student.email || '',
      department: student.department || 'Computer Science',
      year: student.year || '1st Year',
      phone: student.phone || '',
      house_id: student.house_id || houses[0]?.id || '',
      status: student.status || 'ACTIVE',
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.roll_number.trim()) {
      setFormError('Student Name and Roll Number are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (selectedStudent) {
        // Edit existing
        await updateStudent(selectedStudent.id, {
          name: formData.name.trim(),
          roll_number: formData.roll_number.trim(),
          email: formData.email.trim() || null,
          department: formData.department,
          year: formData.year,
          phone: formData.phone.trim() || null,
          house_id: formData.house_id || null,
          status: formData.status,
        });
        success(`Student ${formData.name} updated successfully!`);
      } else {
        // Add new
        await createStudent({
          name: formData.name.trim(),
          roll_number: formData.roll_number.trim(),
          email: formData.email.trim() || null,
          department: formData.department,
          year: formData.year,
          phone: formData.phone.trim() || null,
          house_id: formData.house_id || null,
          status: formData.status,
        });
        success(`Student ${formData.name} registered successfully! (Default login password: stud@sxcce)`);
      }
      setIsFormModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving student:', err);
      let msg = err.message || 'Failed to save student details';
      if (msg.includes('unique') || msg.includes('roll_number')) {
        msg = `A student with roll number "${formData.roll_number}" already exists.`;
      }
      setFormError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      setSubmitting(true);
      await deleteStudent(selectedStudent.id);
      success(`Student record for ${selectedStudent.name} deleted.`);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error deleting student:', err);
      toastError(err.message || 'Failed to delete student');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk House Change Submit
  const handleBulkHouseSubmit = async (e) => {
    e.preventDefault();
    if (!bulkTargetHouseId) {
      toastError('Please select a target house');
      return;
    }
    try {
      setSubmitting(true);
      await bulkUpdateStudentHouse(selectedIds, bulkTargetHouseId);
      const targetHouse = houses.find((h) => h.id === bulkTargetHouseId);
      const hName = targetHouse?.name?.split(' ')[0] || targetHouse?.code || 'House';
      success(`Successfully updated ${selectedIds.length} students to ${hName} House!`);
      setIsBulkHouseModalOpen(false);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      console.error('Error updating house for selected students:', err);
      toastError(err.message || 'Failed to update student houses');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Delete Submit
  const handleBulkDeleteSubmit = async () => {
    try {
      setSubmitting(true);
      await bulkDeleteStudents(selectedIds);
      success(`Successfully deleted ${selectedIds.length} student records.`);
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      console.error('Error deleting selected students:', err);
      toastError(err.message || 'Failed to delete selected students');
    } finally {
      setSubmitting(false);
    }
  };

  const departments = [
    'Computer Science',
    'Mechanical',
    'Civil',
    'Electrical',
    'Biotech',
    'Electronics',
    'Chemical',
    'Information Tech',
  ];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student House Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student registrations, house allocations, and active statuses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/students/import"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-eco-600" />
            Bulk CSV/Excel Import
          </Link>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="w-full lg:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll no, or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-eco-500/20 focus:border-eco-600 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <select
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Houses</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        {/* Selected Items Banner Bar (Above table) */}
        {selectedIds.length > 0 && (
          <div className="px-6 py-3 bg-gradient-to-r from-eco-50 via-emerald-50 to-teal-50 border-b border-eco-200/80 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-eco-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold text-eco-950">
                {selectedIds.length === 1 ? '1 student selected' : `${selectedIds.length} students selected`}
              </span>
              <span className="text-xs text-eco-700 font-medium hidden sm:inline">
                (out of {filteredStudents.length} listed)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBulkTargetHouseId(houses[0]?.id || '');
                  setIsBulkHouseModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-eco-100 text-eco-800 border border-eco-300 font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-eco-600" />
                <span>Change House</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 transition cursor-pointer"
                title="Deselect all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={8} cols={7} />
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No students found</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "Add New Student" or "Bulk Import" to populate the Eco Club roster.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isSomeSelected;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-eco-600 focus:ring-eco-500 cursor-pointer accent-eco-600"
                      aria-label="Select all students"
                    />
                  </th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">House</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((st) => {
                  const isChecked = selectedIds.includes(st.id);
                  return (
                    <tr
                      key={st.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-eco-50/70 hover:bg-eco-50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectStudent(st.id)}
                          className="w-4 h-4 rounded border-slate-300 text-eco-600 focus:ring-eco-500 cursor-pointer accent-eco-600"
                          aria-label={`Select ${st.name}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                        <div className="text-xs text-slate-400">{st.email || 'No email provided'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">
                        {st.roll_number}
                      </td>
                      <td className="py-3 px-4">
                        <HouseBadge code={st.house?.code} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-800">{st.department}</div>
                        <div className="text-[11px] text-slate-400">{st.year}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {st.phone || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            st.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(st)}
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(st)}
                            title="Edit Student"
                            className="p-1.5 text-slate-400 hover:text-eco-600 hover:bg-eco-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(st)}
                            title="Delete Student"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

      {/* FLOATING BULK ACTIONS TOOLBAR (When 1+ items selected) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-eco-500 text-white font-black text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {selectedIds.length === 1 ? 'student selected' : 'students selected'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setBulkTargetHouseId(houses[0]?.id || '');
                setIsBulkHouseModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-eco-400 hover:text-eco-300 font-bold text-xs transition border border-slate-700 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Change House</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs transition border border-rose-800/80 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BULK EDIT HOUSE MODAL */}
      {isBulkHouseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-eco-100 text-eco-700">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Change House Allocation</h3>
                  <p className="text-xs text-slate-500">Reassigning {selectedIds.length} selected students</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkHouseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkHouseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select New House Target *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {houses.map((h) => {
                    const isSelected = bulkTargetHouseId === h.id;
                    return (
                      <button
                        type="button"
                        key={h.id}
                        onClick={() => setBulkTargetHouseId(h.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-eco-600 bg-eco-50/70 ring-2 ring-eco-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <HouseBadge code={h.code} size="sm" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate">
                            {h.name.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-slate-500">{h.code} House</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                This will simultaneously reassign all <strong>{selectedIds.length}</strong> selected students to the chosen House.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkHouseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-white bg-eco-600 hover:bg-eco-700 font-bold shadow-xs cursor-pointer disabled:opacity-60 text-xs flex items-center gap-1.5"
                >
                  {submitting ? 'Updating...' : `Assign ${selectedIds.length} Students`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title={`Delete ${selectedIds.length} Selected Students`}
        message={`Are you sure you want to permanently delete these ${selectedIds.length} student records from the directory? This action cannot be undone and will also remove all weekly marks linked to them.`}
        confirmText={`Delete ${selectedIds.length} Students`}
        isDanger={true}
        loading={submitting}
        onConfirm={handleBulkDeleteSubmit}
        onClose={() => setIsBulkDeleteModalOpen(false)}
      />

      {/* SINGLE STUDENT ADD / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedStudent ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
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

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g. 502433"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year of Study
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  House Allocation
                </label>
                <select
                  value={formData.house_id}
                  onChange={(e) => setFormData({ ...formData, house_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="">No House Assigned</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Active Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={formData.status === 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="text-eco-600"
                    />
                    <span>Active Member</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={formData.status === 'INACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="text-eco-600"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-white bg-eco-600 hover:bg-eco-700 font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting ? 'Saving...' : selectedStudent ? 'Update Student' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT DETAILS MODAL */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Student Profile</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4 bg-slate-50 rounded-2xl mb-4">
              <div className="w-16 h-16 rounded-full bg-eco-100 text-eco-800 text-xl font-black flex items-center justify-center mx-auto mb-2 border border-eco-200">
                {selectedStudent.name?.charAt(0)}
              </div>
              <h4 className="text-base font-extrabold text-slate-900">{selectedStudent.name}</h4>
              <p className="text-xs font-mono text-slate-500">{selectedStudent.roll_number}</p>
              <div className="mt-2">
                <HouseBadge code={selectedStudent.house?.code} size="md" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Department</span>
                <span className="font-bold text-slate-800">{selectedStudent.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Year</span>
                <span className="font-bold text-slate-800">{selectedStudent.year}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-slate-800">{selectedStudent.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Phone</span>
                <span className="font-semibold text-slate-800">{selectedStudent.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-700">{selectedStudent.status}</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Remove Student Record"
        message={`Are you sure you want to delete the student record for "${selectedStudent?.name}" (${selectedStudent?.roll_number})? All associated weekly participation marks will also be permanently removed.`}
        confirmText="Delete Record"
        isDanger={true}
        loading={submitting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
