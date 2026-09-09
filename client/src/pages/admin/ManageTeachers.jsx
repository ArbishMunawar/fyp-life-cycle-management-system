import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";
import {
  createTeacher,
  deleteTeacher,
  getAllProjects,
  getAllUsers,
  updateTeacher,
} from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import {
  AlertTriangle,
  BadgeCheck,
  FileSpreadsheet,
  Plus,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
// At the top — add import
import BulkImportModal from "../../components/modal/BulkImportModal";

const ManageTeachers = () => {
  const { users = [] } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);
  const [showModal, setShowModal] = useState(false);
  // Inside the component — add state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    experties: "",
    maxStudents: "100",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
  }, [dispatch]);

  const teachers = useMemo(() => {
    return (
      (users || []).filter(
        (u) => u.role?.toString().trim().toLowerCase() === "teacher",
      ) || []
    );
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set(
      (teachers || []).map((t) => t.department).filter(Boolean),
    );
    return Array.from(set);
  }, [teachers]);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || teacher.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      experties: "",
      maxStudents: "100",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTeacher) {
      dispatch(updateTeacher({ id: editingTeacher._id, data: formData }));
    }
    handleCloseModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      experties: Array.isArray(teacher.experties)
        ? teacher.experties[0]
        : teacher.experties,
      maxStudents:
        typeof teacher.maxStudents === "number" ? teacher.maxStudents : 10,
    });
    setShowModal(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete._id));
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Manage Teachers</h1>
              <p className="card-subtitle">
                Add, edit, and manage teacher accounts
              </p>
            </div>
            {/* <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Teacher</span>
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
              onClick={() => dispatch(toggleTeacherModal())}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Teacher</span>
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
                  Total Teachers
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.length}
                </p>
              </div>
            </div>
          </div>

          {/* Add more stat cards here if needed */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BadgeCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Assigned Students
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.reduce(
                    (sum, t) => sum + (t.assignedStudents?.length || 0),
                    0,
                  )}
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
                <p className="text-sm font-medium text-slate-600">
                  Departments
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {departments.length}
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
                Search Teachers
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

        {/* TEACHERS LIST TABLE */}
        <div className="card mt-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-slate-800">
              Teachers List
            </h2>
          </div>
          <div className="overflow-x-auto">
            {filteredTeachers && filteredTeachers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {/* Designing headers to match screenshot */}
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Teacher Info
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Experties
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* teacher INFO: Name, Roll Number, then Email */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {/* teacher Name */}
                          <span className="text-sm font-bold text-slate-800 leading-tight">
                            {teacher.name}
                          </span>

                          {/* teacher Email */}
                          <span className="text-xs text-slate-500 leading-tight">
                            {teacher.email}
                          </span>
                        </div>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700 font-medium">
                            {teacher.department || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {typeof teacher.experties === "function"
                          ? "Invalid Data"
                          : Array.isArray(teacher.experties)
                            ? teacher.experties.join(", ")
                            : teacher.experties || "N/A"}
                      </td>

                      {/* PROJECT TITLE */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 truncate max-w-[200px]">
                          {teacher.createdAt
                            ? new Date(teacher.createdAt).toLocaleString()
                            : "-"}
                        </p>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-[11px] font-bold text-blue-600 hover:underline uppercase"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
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
              filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No teacher found matching your criteria.
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
                    Edit Teacher
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Experties
                    </label>

                    <select
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                      required
                      value={formData.experties}
                      onChange={(e) =>
                        setFormData({ ...formData, experties: e.target.value })
                      }
                    >
                      <option value="">Select Area of Experties</option>
                      <option value="Artificial Intelligence">
                        Artificial Intelligence
                      </option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="Software Development">
                        Software Development
                      </option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App Development">
                        Mobile App Development
                      </option>
                      <option value="Database Systems">Database Systems</option>
                      <option value="Computer Networks">
                        Computer Networks
                      </option>
                      <option value="Operating Systems">
                        Operating Systems
                      </option>
                      <option value="Human-Computer Interaction">
                        Human-Computer Interaction
                      </option>
                      <option value="Big Data Analytics">
                        Big Data Analytics
                      </option>
                      <option value="Blockchain Technology">
                        Blockchain Technology
                      </option>
                      <option value="Internet of Things (IoT)">
                        Internet of Things (IoT)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Students
                    </label>
                    <input
                      type="number"
                      required
                      // max={100}
                      min={1}
                      value={formData.maxStudents}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStudents: e.target.value,
                        })
                      }
                      className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
                    />
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

          {showDeleteModal && teacherToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Delete Teacher
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Are you sure you want to delete{" "}
                    <span>
                      {teacherToDelete.name}? This action cannot be undone.
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

          {isCreateTeacherModalOpen && <AddTeacher />}
        </div>
      </div>
    </>
  );
};

export default ManageTeachers;
