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
} from 'lucide-react';
import {
  getStudents,
  getHouses,
  createStudent,
  updateStudent,
  deleteStudent,
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

  const departments = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Biotech', 'Electronics', 'Chemical', 'Information Tech'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="space-y-6 pb-12">
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

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={8} cols={6} />
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
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
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
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(st)}
                          title="Edit Student"
                          className="p-1.5 text-slate-400 hover:text-eco-600 hover:bg-eco-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(st)}
                          title="Delete Student"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

      {/* ADD / EDIT STUDENT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-eco-100 text-eco-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStudent ? 'Edit Student Details' : 'Register New Student'}
                  </h3>
                  <p className="text-xs text-slate-500">Eco Club House Member record</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Default Password Banner */}
            <div className="mb-4 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold block">Default Student Portal Password:</span>
                <span className="font-mono text-blue-800 font-black text-sm">stud@sxcce</span>
              </div>
              <span className="text-[10px] text-blue-600 bg-white border border-blue-200 px-2 py-1 rounded-md font-semibold">
                Auto-assigned for Login
              </span>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-eco-600"
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
                    placeholder="e.g. 23CS042"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-hidden focus:border-eco-600"
                  />
                </div>
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
                    placeholder="alex@college.edu"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-eco-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-eco-600"
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white"
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    House Allocation *
                  </label>
                  <select
                    value={formData.house_id}
                    onChange={(e) => setFormData({ ...formData, house_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Membership Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
                className="text-slate-400 hover:text-slate-600 p-1"
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
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
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
