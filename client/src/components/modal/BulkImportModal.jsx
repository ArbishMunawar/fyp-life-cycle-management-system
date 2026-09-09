// src/components/modal/BulkImportModal.jsx
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  bulkImportStudents,
  bulkImportTeachers,
} from "../../store/slices/adminSlice";
import * as XLSX from "xlsx";

const BulkImportModal = ({ type = "student", onClose }) => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { created, failed }
  const [dragOver, setDragOver] = useState(false);

  const isStudent = type === "student";
  const title = isStudent ? "Bulk Import Students" : "Bulk Import Teachers";

  // ── Download sample Excel template ──────────────────────────────────────
  const downloadTemplate = () => {
    const studentColumns = [
      { name: "name", example: "Ali Khan" },
      { name: "email", example: "ali@example.com" },
      { name: "password", example: "password123" },
      { name: "department", example: "CS Morning" },
      { name: "registrationNumber", example: "2022-CS-2001" },
    ];

    const teacherColumns = [
      { name: "name", example: "Dr. Ahmed" },
      { name: "email", example: "ahmed@example.com" },
      { name: "password", example: "password123" },
      { name: "department", example: "CS Morning" },
      { name: "registrationNumber", example: "T-2022-2001" },
      { name: "experties", example: "Web Development" },
      { name: "maxStudents", example: "10" },
    ];

    const cols = isStudent ? studentColumns : teacherColumns;

    // Header row
    const header = cols.map((c) => c.name);
    // Example row
    const example = cols.map((c) => c.example);
    // Extra sample rows
    const sample2 = isStudent
      ? [
          "Sara Ahmed",
          "sara@example.com",
          "pass1234",
          "CS Evening",
          "2022-CS-2002",
        ]
      : [
          "Prof. Nadia",
          "nadia@example.com",
          "pass1234",
          "Software Engineering",
          "T-2022-2002",
          "Artificial Intelligence",
          "8",
        ];

    const ws = XLSX.utils.aoa_to_sheet([header, example, sample2]);

    // Style the header (column widths)
    ws["!cols"] = header.map(() => ({ wch: 22 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isStudent ? "Students" : "Teachers");
    XLSX.writeFile(
      wb,
      `${isStudent ? "students" : "teachers"}_import_template.xlsx`,
    );
  };

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      alert("Please upload a .xlsx or .xls file only.");
      return;
    }
    setFile(selectedFile);
    setResults(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const action = isStudent
        ? bulkImportStudents(file)
        : bulkImportTeachers(file);
      const res = await dispatch(action);

      if (res.payload) {
        setResults(res.payload); // { created: [...], failed: [...] }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1 — Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">
              Step 1 — Download the Template
            </p>
            <p className="text-xs text-blue-600 mb-3">
              Fill in the Excel template with your data. Do not change the
              column headers.
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download Template (.xlsx)
            </button>
          </div>

          {/* Required columns info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Required Columns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(isStudent
                ? [
                    "name",
                    "email",
                    "password",
                    "department",
                    "registrationNumber",
                  ]
                : [
                    "name",
                    "email",
                    "password",
                    "department",
                    "registrationNumber",
                    "experties",
                    "maxStudents",
                  ]
              ).map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 text-xs rounded font-mono"
                >
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              * experties and maxStudents are optional for teachers (defaults:
              empty, 10)
            </p>
          </div>

          {/* Step 2 — Upload File */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Step 2 — Upload Your Filled File
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : file
                    ? "border-green-400 bg-green-50"
                    : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={fileRef}
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />
              <Upload
                className={`w-8 h-8 mx-auto mb-2 ${file ? "text-green-500" : "text-slate-400"}`}
              />
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    {file.name}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB — Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Drag & drop your Excel file here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    or click to browse — .xlsx, .xls only
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import {isStudent ? "Students" : "Teachers"}
              </>
            )}
          </button>

          {/* Results */}
          {results && (
            <div className="space-y-3 pt-2">
              {/* Success count */}
              {results.created?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-800">
                      {results.created.length}{" "}
                      {isStudent ? "student" : "teacher"}(s) created
                      successfully
                    </p>
                  </div>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {results.created.map((u, i) => (
                      <li
                        key={i}
                        className="text-xs text-green-700 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="font-medium">{u.name}</span>
                        <span className="text-green-500">
                          ({u.registrationNumber})
                        </span>
                        <span className="text-green-400">— {u.email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Failures */}
              {results.failed?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-800">
                      {results.failed.length} row(s) failed
                    </p>
                  </div>
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                    {results.failed.map((f, i) => (
                      <li key={i} className="text-xs text-red-700">
                        <span className="font-medium">
                          Row {i + 1} (
                          {f.row?.email || f.row?.name || "unknown"})
                        </span>
                        : {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
