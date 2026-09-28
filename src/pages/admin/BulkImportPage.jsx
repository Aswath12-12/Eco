import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
  RefreshCw,
  FileText,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getHouses, getStudents, bulkInsertStudents } from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import { useToast } from '../../context/ToastContext';

export default function BulkImportPage() {
  const [houses, setHouses] = useState([]);
  const [existingRollNumbers, setExistingRollNumbers] = useState(new Set());
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  // Analysis result
  const [parsedRows, setParsedRows] = useState([]);
  const [validRecords, setValidRecords] = useState([]);
  const [invalidRecords, setInvalidRecords] = useState([]);
  const [duplicateRecords, setDuplicateRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('VALID'); // 'VALID', 'INVALID', 'DUPLICATES'

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        const [hList, sList] = await Promise.all([getHouses(), getStudents()]);
        setHouses(hList);
        const rolls = new Set(sList.map((s) => s.roll_number?.trim().toUpperCase()));
        setExistingRollNumbers(rolls);
      } catch (err) {
        console.error('Error fetching houses or students for validation:', err);
      }
    }
    init();
  }, []);

  // Download Sample CSV template
  const downloadSampleTemplate = (format = 'csv') => {
    const sampleData = [
      {
        'Roll Number': '23CS101',
        Name: 'Aarav Sharma',
        Email: 'aarav.sharma@college.edu',
        Department: 'Computer Science',
        Year: '2nd Year',
        Phone: '9876543210',
        House: 'GREEN',
      },
      {
        'Roll Number': '23ME102',
        Name: 'Diya Patel',
        Email: 'diya.patel@college.edu',
        Department: 'Mechanical',
        Year: '2nd Year',
        Phone: '9876543211',
        House: 'BLUE',
      },
      {
        'Roll Number': '24CV103',
        Name: 'Rohan Verma',
        Email: 'rohan.verma@college.edu',
        Department: 'Civil',
        Year: '1st Year',
        Phone: '9876543212',
        House: 'RED',
      },
      {
        'Roll Number': '22EE104',
        Name: 'Sneha Reddy',
        Email: 'sneha.reddy@college.edu',
        Department: 'Electrical',
        Year: '3rd Year',
        Phone: '9876543213',
        House: 'YELLOW',
      },
    ];

    if (format === 'csv') {
      const csv = Papa.unparse(sampleData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ecoclub_students_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, 'ecoclub_students_template.xlsx');
    }
  };

  // Process raw parsed rows
  const processRows = (rawRows) => {
    const valid = [];
    const invalid = [];
    const duplicates = [];
    const seenRollsInFile = new Set();

    // Build house lookup map: code (uppercase) -> house object
    const houseMap = {};
    houses.forEach((h) => {
      houseMap[h.code.toUpperCase()] = h;
      houseMap[h.name.toUpperCase()] = h;
    });

    rawRows.forEach((row, index) => {
      // Normalize keys by removing spaces and lowercase
      const normalizedRow = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        normalizedRow[cleanKey] = row[key];
      });

      const rollNumber = String(
        normalizedRow['rollnumber'] ||
        normalizedRow['rollno'] ||
        normalizedRow['roll'] ||
        ''
      ).trim();

      const name = String(normalizedRow['name'] || normalizedRow['fullname'] || '').trim();
      const email = String(normalizedRow['email'] || '').trim();
      const department = String(normalizedRow['department'] || normalizedRow['dept'] || 'General').trim();
      const year = String(normalizedRow['year'] || '1st Year').trim();
      const phone = String(normalizedRow['phone'] || normalizedRow['mobile'] || '').trim();
      const houseInput = String(normalizedRow['house'] || normalizedRow['housecode'] || '').trim().toUpperCase();

      const errors = [];

      if (!rollNumber) {
        errors.push('Missing Roll Number');
      }
      if (!name) {
        errors.push('Missing Student Name');
      }

      const upperRoll = rollNumber.toUpperCase();

      // Check duplicates in database
      if (existingRollNumbers.has(upperRoll)) {
        errors.push(`Roll number "${rollNumber}" already exists in Supabase`);
        duplicates.push({ rowNumber: index + 2, rollNumber, name, email, department, year, reason: 'Already registered in database' });
        return;
      }

      // Check duplicates within this file
      if (seenRollsInFile.has(upperRoll)) {
        errors.push(`Duplicate roll number "${rollNumber}" found earlier in this file`);
        duplicates.push({ rowNumber: index + 2, rollNumber, name, email, department, year, reason: 'Duplicate in uploaded file' });
        return;
      }
      if (upperRoll) seenRollsInFile.add(upperRoll);

      // Validate house
      let matchedHouse = null;
      if (houseInput) {
        if (houseMap[houseInput]) {
          matchedHouse = houseMap[houseInput];
        } else if (houseInput.includes('GREEN')) {
          matchedHouse = houseMap['GREEN'];
        } else if (houseInput.includes('BLUE')) {
          matchedHouse = houseMap['BLUE'];
        } else if (houseInput.includes('RED')) {
          matchedHouse = houseMap['RED'];
        } else if (houseInput.includes('YELLOW')) {
          matchedHouse = houseMap['YELLOW'];
        } else {
          errors.push(`Invalid house "${houseInput}". Allowed: GREEN, BLUE, RED, YELLOW`);
        }
      } else {
        // Default to green if not specified
        matchedHouse = houses[0] || null;
      }

      const record = {
        rowNumber: index + 2,
        roll_number: rollNumber,
        name,
        email: email || null,
        department,
        year,
        phone: phone || null,
        house_id: matchedHouse?.id || null,
        houseCode: matchedHouse?.code || houseInput,
        status: 'ACTIVE',
      };

      if (errors.length > 0) {
        invalid.push({ ...record, errors });
      } else {
        valid.push(record);
      }
    });

    setValidRecords(valid);
    setInvalidRecords(invalid);
    setDuplicateRecords(duplicates);
    setActiveTab(valid.length > 0 ? 'VALID' : 'INVALID');
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setParsing(true);

    const ext = uploadedFile.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedRows(results.data);
          processRows(results.data);
          setParsing(false);
        },
        error: (err) => {
          toastError(`Error parsing CSV: ${err.message}`);
          setParsing(false);
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
          setParsedRows(data);
          processRows(data);
        } catch (err) {
          toastError(`Error reading Excel file: ${err.message}`);
        } finally {
          setParsing(false);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      toastError('Unsupported format. Please upload a .csv or .xlsx file.');
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (validRecords.length === 0) {
      toastError('No valid records to import.');
      return;
    }

    try {
      setImporting(true);
      const payload = validRecords.map((r) => ({
        roll_number: r.roll_number,
        name: r.name,
        email: r.email,
        department: r.department,
        year: r.year,
        phone: r.phone,
        house_id: r.house_id,
        status: 'ACTIVE',
      }));

      await bulkInsertStudents(payload);
      success(`Successfully imported ${payload.length} students into Supabase!`);
      navigate('/admin/students');
    } catch (err) {
      console.error('Import error:', err);
      toastError(err.message || 'Bulk import failed. Please verify Supabase connection.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/students"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bulk Student Import
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload CSV or Excel files to automatically register students and assign houses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadSampleTemplate('csv')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-eco-600" />
            Download CSV Template
          </button>
          <button
            onClick={() => downloadSampleTemplate('xlsx')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Excel Template
          </button>
        </div>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Default Student Login Password:</span>
            <span className="font-mono text-blue-800 font-black text-sm bg-white px-2 py-0.5 rounded border border-blue-200">
              stud@sxcce
            </span>
          </div>
          <span className="text-[11px] text-blue-700">
            Enables immediate student portal login using their uploaded email
          </span>
        </div>

        <label className="border-2 border-dashed border-slate-300 hover:border-eco-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-eco-50/20 group">
          <div className="w-14 h-14 rounded-2xl bg-eco-100 text-eco-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-800 mb-1">
            {fileName ? fileName : 'Click to select or drag and drop student spreadsheet'}
          </p>
          <p className="text-xs text-slate-400">
            Accepts CSV, XLSX or XLS (Columns: Roll Number, Name, Email, Department, Year, Phone, House)
          </p>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* RESULTS PREVIEW & STATS */}
      {file && (
        <div className="space-y-6">
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('VALID')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                activeTab === 'VALID'
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Valid Records Ready
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-2">{validRecords.length}</div>
              <div className="text-[11px] text-emerald-700 mt-1">Ready for database import</div>
            </div>

            <div
              onClick={() => setActiveTab('INVALID')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                activeTab === 'INVALID'
                  ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Invalid Records
                </span>
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-900 mt-2">{invalidRecords.length}</div>
              <div className="text-[11px] text-rose-700 mt-1">Missing required fields or invalid house</div>
            </div>

            <div
              onClick={() => setActiveTab('DUPLICATES')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                activeTab === 'DUPLICATES'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Duplicates Detected
                </span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900 mt-2">{duplicateRecords.length}</div>
              <div className="text-[11px] text-amber-700 mt-1">Already registered in Supabase or file</div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeTab === 'VALID' && `Valid Records Preview (${validRecords.length})`}
                  {activeTab === 'INVALID' && `Invalid Records with Errors (${invalidRecords.length})`}
                  {activeTab === 'DUPLICATES' && `Duplicate Records Skipped (${duplicateRecords.length})`}
                </h3>
              </div>

              {activeTab === 'VALID' && validRecords.length > 0 && (
                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="px-5 py-2 text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Import {validRecords.length} Valid Records</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="overflow-x-auto max-h-96">
              {activeTab === 'VALID' && (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">House</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {validRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-400">{r.rowNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.roll_number}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{r.email || '—'}</td>
                        <td className="py-2.5 px-3">{r.department}</td>
                        <td className="py-2.5 px-3">{r.year}</td>
                        <td className="py-2.5 px-3">
                          <HouseBadge code={r.houseCode} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'INVALID' && (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-rose-50/50 text-[10px] uppercase font-bold text-rose-800 border-b border-rose-100">
                    <tr>
                      <th className="py-2.5 px-3">Row #</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Validation Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {invalidRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-rose-50/30">
                        <td className="py-2.5 px-3 text-slate-400">{r.rowNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">{r.roll_number || 'Missing'}</td>
                        <td className="py-2.5 px-3">{r.name || 'Missing'}</td>
                        <td className="py-2.5 px-3 text-rose-700 font-semibold">
                          {r.errors.join(' • ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'DUPLICATES' && (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-amber-50/50 text-[10px] uppercase font-bold text-amber-800 border-b border-amber-100">
                    <tr>
                      <th className="py-2.5 px-3">Row #</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {duplicateRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-amber-50/30">
                        <td className="py-2.5 px-3 text-slate-400">{r.rowNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-900">{r.rollNumber}</td>
                        <td className="py-2.5 px-3">{r.name}</td>
                        <td className="py-2.5 px-3 text-amber-700 font-semibold">{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
