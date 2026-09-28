import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Shield,
  Users,
  Award,
  RefreshCw,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  getHouseRankings,
  getLeaderboardData,
  getWeeklyMarks,
  getActivities,
} from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import { useToast } from '../../context/ToastContext';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('HOUSES'); // 'HOUSES', 'STUDENTS', 'WEEKLY', 'ACTIVITIES'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { success, error: toastError } = useToast();

  const generateReport = async (type = activeReport) => {
    try {
      setLoading(true);
      if (type === 'HOUSES') {
        const houses = await getHouseRankings();
        const formatted = houses.map((h) => ({
          Rank: h.rank,
          'House Code': h.code,
          'House Name': h.name,
          'Total Students': h.totalStudents,
          'Active Students': h.activeStudents,
          'Total Marks': h.totalMarks,
          'Average Marks': h.averageMarks,
          'Participation Rate (%)': `${h.participationRate}%`,
        }));
        setReportData(formatted);
      } else if (type === 'STUDENTS') {
        const students = await getLeaderboardData();
        const formatted = students.map((s) => ({
          Rank: s.rank,
          'Roll Number': s.roll_number,
          Name: s.name,
          Email: s.email || 'N/A',
          House: s.house?.name || s.house?.code || 'N/A',
          Department: s.department,
          Year: s.year,
          Status: s.status,
          'Activities Count': s.activitiesCount,
          'Total Marks': s.totalMarks,
          'Average Marks': s.averageMarks,
        }));
        setReportData(formatted);
      } else if (type === 'WEEKLY') {
        const marks = await getWeeklyMarks();
        const formatted = marks.map((m) => ({
          Week: `Week ${m.week_number}`,
          'Roll Number': m.student?.roll_number,
          Student: m.student?.name,
          House: m.student?.house?.code || 'N/A',
          Activity: m.activity?.name,
          Marks: m.marks,
          'Max Marks': m.activity?.maximum_mark,
          Remarks: m.remarks || '',
          Date: new Date(m.created_at).toLocaleDateString(),
        }));
        setReportData(formatted);
      } else if (type === 'ACTIVITIES') {
        const activities = await getActivities();
        const allMarks = await getWeeklyMarks();

        const actStats = activities.map((act) => {
          const matchingMarks = allMarks.filter((m) => m.activity_id === act.id);
          const totalEntrants = matchingMarks.length;
          const totalPointsAwarded = matchingMarks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
          const avgScore = totalEntrants > 0 ? (totalPointsAwarded / totalEntrants).toFixed(1) : 0;

          return {
            'Activity Name': act.name,
            Date: new Date(act.activity_date).toLocaleDateString(),
            'Max Marks': act.maximum_mark,
            'Total Participants': totalEntrants,
            'Total Points Awarded': totalPointsAwarded,
            'Average Points / Participant': avgScore,
            Description: act.description || '',
          };
        });
        setReportData(actStats);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      toastError('Failed to generate report from Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport(activeReport);
  }, [activeReport]);

  const exportToCSV = () => {
    if (reportData.length === 0) {
      toastError('No data available to export');
      return;
    }
    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecoclub_${activeReport.toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Report exported to CSV successfully!');
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      toastError('No data available to export');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeReport}_Report`);
    XLSX.writeFile(wb, `ecoclub_${activeReport.toLowerCase()}_report.xlsx`);
    success('Report exported to Excel successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Reports Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Export comprehensive house analytics, student performance, and participation metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={loading || reportData.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-eco-600" />
            Export to CSV
          </button>
          <button
            onClick={exportToExcel}
            disabled={loading || reportData.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export to Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'HOUSES', label: 'House Performance Report', icon: Shield },
          { key: 'STUDENTS', label: 'Student Performance Report', icon: Users },
          { key: 'WEEKLY', label: 'Weekly Participation Report', icon: Award },
          { key: 'ACTIVITIES', label: 'Activity Performance Report', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveReport(tab.key)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'border-eco-600 bg-eco-50/70 shadow-xs ring-2 ring-eco-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-xl ${
                    isActive ? 'bg-eco-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Live Query</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Data Table Preview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-eco-600" />
            <span className="font-bold text-slate-900 text-sm">
              Data Preview ({reportData.length} Records)
            </span>
          </div>
          <button
            onClick={() => generateReport(activeReport)}
            disabled={loading}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh Report
          </button>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
              Aggregating live report from Supabase database...
            </div>
          ) : reportData.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No data records available for this report type.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  {Object.keys(reportData[0] || {}).map((header, idx) => (
                    <th key={idx} className="py-3 px-3.5 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reportData.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 whitespace-nowrap">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
