
import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Folder,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  approveProject,
  getProject,
  rejectProject,
} from "../../store/slices/adminSlice";

import { downloadProjectFile } from "../../store/slices/projectSlice";

const ProjectsPage = () => {
  const dispatch = useDispatch();

  const { projects = [] } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");

  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  // SUPERVISORS
  const supervisors = useMemo(() => {
    const set = new Set(
      projects?.map((p) => p?.supervisor?.name).filter(Boolean),
    );

    return Array.from(set);
  }, [projects]);

  // FILTER PROJECTS
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      (project?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (project?.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || project?.status === filterStatus;

    const matchesSupervisor =
      filterSupervisor === "all" ||
      project?.supervisor?.name === filterSupervisor;

    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  // ALL FILES
  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p?.files || []).map((f) => ({
        projectId: p?._id,
        fileId: f?._id,
        originalName: f?.originalName,
        uploadedAt: f?.uploadedAt,
        projectTitle: p?.title,
        studentName: p?.student?.name,
      })),
    );
  }, [projects]);

  // FILTER FILES
  const filteredFiles = files?.filter(
    (file) =>
      (file?.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file?.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file?.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()),
  );

  // DOWNLOAD FILE
  const handleDownloadFile = async (file) => {
    try {
      const projectId = file?.projectId;
      const fileId = file?.fileId;

      if (!projectId || !fileId) {
        toast.error("Missing file information");
        return;
      }

      const resultAction = await dispatch(
        downloadProjectFile({
          projectId,
          fileId,
        }),
      );

      if (downloadProjectFile.rejected.match(resultAction)) {
        toast.error("Download failed");
        return;
      }

      const blob = resultAction?.payload?.blob;

      if (!blob) {
        toast.error("No file received");
        return;
      }

      const url = window.URL.createObjectURL(new Blob([blob]));

      const link = document.createElement("a");

      link.href = url;
      link.download = file?.originalName || "download";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
      toast.error("Download failed");
    }
  };

  // VIEW PROJECT
  const handleViewProject = async (projectId) => {
    try {
      const res = await dispatch(getProject(projectId));

      console.log(res);

      if (getProject.fulfilled.match(res)) {
        setCurrentProject(res.payload);
        setShowViewModal(true);
      } else {
        toast.error("Failed to fetch project");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // APPROVE / REJECT
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      if (newStatus === "approved") {
        await dispatch(approveProject(projectId));
      }

      if (newStatus === "rejected") {
        await dispatch(rejectProject(projectId));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // STATUS COLOR
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";

      case "approved":
        return "bg-blue-100 text-blue-800";

      case "pending":
        return "bg-orange-100 text-orange-800";

      case "rejected":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // STATS
  const projectStats = [
    {
      title: "Total Projects",
      value: projects?.length || 0,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: Folder,
    },

    {
      title: "Pending Review",
      value:
        projects?.filter((p) => p?.status === "pending")?.length || 0,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },

    {
      title: "Completed",
      value:
        projects?.filter((p) => p?.status === "completed")?.length || 0,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },

    {
      title: "Rejected",
      value:
        projects?.filter((p) => p?.status === "rejected")?.length || 0,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="card-header">
          <h1 className="card-title">All Projects</h1>

          <p className="card-subtitle">
            View and manage all student projects.
          </p>
        </div>

        <button
          onClick={() => setIsReportsOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FileDown className="w-5 h-5" />

          <span>Download Reports</span>
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {projectStats.map((item, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${item.bg}`}>
                <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  {item.title}
                </p>

                <p className="text-lg font-semibold text-slate-800">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Projects
            </label>

            <input
              type="text"
              className="input w-full"
              placeholder="Search by project title or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Status
            </label>

            <select
              className="input w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Projects</option>
              <option value="pending">Pending Projects</option>
              <option value="approved">Approved Projects</option>
              <option value="completed">Completed Projects</option>
              <option value="rejected">Rejected Projects</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter Supervisor
            </label>

            <select
              className="input w-full"
              value={filterSupervisor}
              onChange={(e) => setFilterSupervisor(e.target.value)}
            >
              <option value="all">All Supervisors</option>

              {supervisors.map((supervisor) => (
                <option key={supervisor} value={supervisor}>
                  {supervisor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
     <div className="card overflow-hidden">
  <div className="card-header">
    <h2 className="card-title">Projects Overview</h2>
  </div>

  {/* SAFE SCROLL WRAPPER */}
  <div className="w-full overflow-x-auto">
    <table className="w-full table-auto min-w-[800px]">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
            Project
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
            Student
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
            Supervisor
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
            Deadline
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
            Status
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
            Actions
          </th>
        </tr>
      </thead>


<tbody className="bg-white divide-y divide-slate-200">
  {filteredProjects?.map((project) => (
    <tr key={project?._id} className="hover:bg-slate-50 align-top">
      
      {/* PROJECT */}
      <td className="px-6 py-4">
        <div className="space-y-1 max-w-xs">
          <div className="text-sm font-semibold text-slate-900 truncate">
            {project?.title}
          </div>

          <div className="text-xs text-slate-500 line-clamp-2">
            {project?.description}
          </div>

          <div className="text-[11px] text-slate-400">
            Due:{" "}
            {project?.deadline
              ? new Date(project.deadline).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </td>

      {/* STUDENT */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-slate-900">
          {project?.student?.name}
        </div>

        <div className="text-xs text-slate-500">
          {project?.student?.email || "No email"}
        </div>
      </td>

      {/* SUPERVISOR */}
      <td className="px-6 py-4">
        {project?.supervisor?.name ? (
          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            {project.supervisor.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        )}
      </td>

      {/* DEADLINE */}
      <td className="px-6 py-4 text-sm text-slate-600">
        {project?.deadline
          ? new Date(project.deadline).toLocaleDateString()
          : "N/A"}
      </td>

      {/* STATUS */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            project?.status,
          )}`}
        >
          {project?.status}
        </span>
      </td>

      {/* ACTIONS (FIXED CLEAN LAYOUT) */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2 w-fit">
          
          <button
            onClick={() => handleViewProject(project?._id)}
            className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            View
          </button>

          {project?.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleStatusChange(project?._id, "approved")
                }
                className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  handleStatusChange(project?._id, "rejected")
                }
                className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  ))}
</tbody>
    
    </table>
  </div>

  {filteredProjects?.length === 0 && (
    <div className="text-center py-8 text-slate-500">
      No projects found.
    </div>
  )}
</div>

      {/* VIEW MODAL */}
      {showViewModal && currentProject && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Project Details
              </h3>

              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="label">Title</label>

                <div className="input bg-slate-50">
                  {currentProject?.title || "-"}
                </div>
              </div>

              <div>
                <label className="label">Description</label>

                <div className="input bg-slate-50 min-h-[120px]">
                  {currentProject?.description || "-"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Student</label>

                  <div className="input bg-slate-50">
                    {currentProject?.student?.name || "-"}
                  </div>
                </div>

                <div>
                  <label className="label">Supervisor</label>

                  <div className="input bg-slate-50">
                    {currentProject?.supervisor?.name || "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>

                  <div className="input bg-slate-50 capitalize">
                    {currentProject?.status}
                  </div>
                </div>

                <div>
                  <label className="label">Deadline</label>

                  <div className="input bg-slate-50">
                    {currentProject?.deadline
                      ? new Date(
                          currentProject.deadline,
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Files</label>

                {(currentProject?.files || []).length === 0 ? (
                  <div className="text-slate-500 text-sm">
                    No files uploaded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentProject?.files?.map((file) => (
                      <div
                        key={file?._id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded"
                      >
                        <div className="text-sm text-slate-700">
                          {file?.originalName || "Unnamed File"}
                        </div>

                        <button
                          onClick={() =>
                            handleDownloadFile({
                              projectId: currentProject?._id,
                              fileId: file?._id,
                              originalName:
                                file?.originalName,
                            })
                          }
                          className="btn-outline"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS MODAL */}
      {isReportsOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-slate-900">
                All Files
              </h3>

              <button
                onClick={() => setIsReportsOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                className="input w-full"
                placeholder="Search by file name, project title or student name"
                value={reportSearch}
                onChange={(e) =>
                  setReportSearch(e.target.value)
                }
              />
            </div>

            {filteredFiles?.length === 0 ? (
              <div className="text-slate-500">
                No files found.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles?.map((f) => (
                  <div
                    key={`${f.projectId}-${f.fileId}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {f?.originalName}
                      </div>

                      <div className="text-sm text-slate-500">
                        {f?.projectTitle} - {f?.studentName}
                      </div>
                    </div>

                    <button
                      className="btn-outline"
                      onClick={() =>
                        handleDownloadFile(f)
                      }
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;