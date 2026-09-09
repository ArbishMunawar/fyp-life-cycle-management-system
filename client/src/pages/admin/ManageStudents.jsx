import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import {
  createStudent,
  deleteStudent,
  getAllProjects,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import {
  Plus,
  CheckCircle,
  TriangleAlert,
  Users,
  X,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
// At the top — add import
import BulkImportModal from "../../components/modal/BulkImportModal";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);
  // Inside the component — add state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
  }, [dispatch]);

  const students = useMemo(() => {
    const studentUsers = (users || []).filter(
      (u) => u.role?.toString().trim().toLowerCase() === "student",
    );

    return studentUsers.map((student) => {
      // const studentProject = (projects || []).find(
      //   (p) => p.student === student._id,
      // );
      const studentProject = (projects || []).find(
        (p) => (p.student?._id || p.student) === student._id,
      );
      return {
        ...student,
        projectTitle: studentProject?.title || null,
        // supervisor: studentProject?.supervisor || null,
        supervisor:
          studentProject?.supervisor?._id || studentProject?.supervisor || null,
        projectStatus: studentProject?.status || null,
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set(
      (students || []).map((s) => s.department).filter(Boolean),
    );
    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    }
    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
      registrationNumber: student.registrationNumber || "",
    });
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Manage Students</h1>
              <p className="card-subtitle">
                Add, edit, and manage student accounts
              </p>
            </div>
            {/* <button
              onClick={() => dispatch(toggleStudentModal())}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Student</span>
            </button> */}

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {/* Bulk Import Button */}
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Bulk Import (Excel)
              </button>

              {/* Existing Add Button */}
              <button
                onClick={() => dispatch(toggleStudentModal())}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Student</span>
              </button>
            </div>
            {/* Add the modal at the bottom */}
            {showBulkModal && (
              <BulkImportModal
                type="student" // or "teacher" for ManageTeachers
                onClose={() => setShowBulkModal(false)}
              />
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Students
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.length}
                </p>
              </div>
            </div>
          </div>

          {/* Add more stat cards here if needed */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Completed Projects
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.filter((s) => s.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TriangleAlert className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Unassigned</p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.filter((s) => !s.supervisor).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Dropdown */}
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Department
              </label>
              <select
                className="input-field w-full"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STUDENT LIST TABLE */}
        <div className="card mt-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-slate-800">
              Students List
            </h2>
          </div>
          <div className="overflow-x-auto">
            {filteredStudents && filteredStudents.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {/* Designing headers to match screenshot */}
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Department & Year
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Project Title
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* STUDENT INFO: Name, Roll Number, then Email */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {/* Student Name */}
                          <span className="text-sm font-bold text-slate-800 leading-tight">
                            {student.name}
                          </span>

                          {/* Student Email */}
                          <span className="text-xs text-slate-500 leading-tight">
                            {student.email}
                          </span>
                        </div>
                      </td>

                      {/* ROLL NUMBER */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">
                          {student.registrationNumber || "-"}
                        </span>
                      </td>
                      {/* DEPARTMENT & YEAR */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700 font-medium">
                            {student.department || "N/A"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date().getFullYear()}{" "}
                            {/* This will show 2026 */}
                          </span>
                        </div>
                      </td>

                      {/* SUPERVISOR */}
                      {/* <td className="px-6 py-4">
                        {student.supervisor ? (
                          <span className="text-sm text-slate-600">
                            {student.supervisor.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-full uppercase">
                            Not Assigned
                          </span>
                        )}
                      </td> */}

                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* {console.log(student?.supervisor)} */}
                        {student.supervisor ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-green-800 bg-green-100">
                            {
                              // users?.find((u) => u._id === student?.supervisor)
                              //   ?.name
                              student.supervisorName ||
                                users?.find(
                                  (u) => u._id === student?.supervisor,
                                )?.name
                            }
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100">
                            {student.projectStatus === "rejected"
                              ? "Rejected"
                              : "Not Assigned"}
                          </span>
                        )}
                      </td>

                      {/* PROJECT TITLE */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 truncate max-w-[200px]">
                          {student.projectTitle || "-"}
                        </p>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-[11px] font-bold text-blue-600 hover:underline uppercase"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="text-[11px] font-bold text-red-600 hover:underline uppercase"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No students found matching your criteria.
                </div>
              )
            )}
          </div>

          {/* Edit  student Model  */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit Student
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {/* Content for the modal would go here */}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>

                    <select
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    >
                      <option value="">Select Department</option>

                      {/* Computer Science Options */}
                      <option value="CS Morning">
                        Computer Science (Morning)
                      </option>
                      <option value="CS Evening">
                        Computer Science (Evening)
                      </option>

                      {/* Other Requested Departments */}
                      <option value="Software Engineering">
                        Software Engineering
                      </option>
                      <option value="Information Technology">
                        Information Technology
                      </option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-danger"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Update Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDeleteModal && studentToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Delete Student
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Are you sure you want to delete{" "}
                    <span>
                      {studentToDelete.name}? This action cannot be undone.
                    </span>
                  </p>

                  <div className="flex justify-center space-x-3">
                    <button onClick={cancelDelete} className="btn-secondary">
                      Cancel
                    </button>
                    <button onClick={confirmDelete} className="btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCreateStudentModalOpen && <AddStudent />}
        </div>
      </div>
    </>
  );
};

export default ManageStudents;
