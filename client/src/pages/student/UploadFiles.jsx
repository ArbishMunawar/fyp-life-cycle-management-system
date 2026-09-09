import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  toast } from "react-toastify";
import {
  downloadFile,
  fetchProject,
  uploadFiles,
} from "../../store/slices/studentSlice";
import { Archive, FileText, Icon, FileCode, X, FilePlus } from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);

  // useEffect(() => {
  //   if (!project) {
  //     dispatch(fetchProject());
  //   }
  // }, [dispatch]);

  useEffect(() => {
    const loadData = async () => {
      if (!project) {
        await dispatch(fetchProject());
      }
    };

    loadData();
  }, [dispatch, project?._id]);
  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  const handleUpload = async (e) => {
    let activeProject = project;
    // if (!activeProject) {
    //   const action = await dispatch(fetchProject());
    //   if (fetchProject.fulfilled.match(action)) {
    //     activeProject = action.payload?.project || action.payload;
    //   }
    // }
    if (selectedFiles.length === 0) return;
    dispatch(uploadFiles({ projectId: project?._id, files: selectedFiles }));
    setSelectedFiles([]);
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const color =
      extension === "pdf"
        ? "text-red-500"
        : ["doc", "docx"].includes(extension)
          ? "text-blue-500"
          : ["ppt", "pptx"].includes(extension)
            ? "text-orange-500"
            : "text-slate-500";

    // 2. Determine which Icon to use
    let IconComponent = File; // Default generic icon
    if (extension === "pdf" || ["doc", "docx"].includes(extension)) {
      IconComponent = FileText;
    } else if (["ppt", "pptx"].includes(extension)) {
      IconComponent = Archive;
    } else if (["zip", "rar", "tar"].includes(extension)) {
      IconComponent = FileCode;
    }
    // 3. Return the component directly
    return <IconComponent className={`w-8 h-8 ${color}`} />;
  };

  // const handleDownloadFile = async (file) => {
  //   // Check for both possible ID formats
  //   const projectId = file.projectId || project?._id;
  //   const fileId = file.fileId || file._id;

  //   if (!projectId || !fileId) {
  //     toast.error("Missing file identification");
  //     return;
  //   }

  //   const res = await dispatch(downloadFile({ projectId, fileId })).then(
  //     (res) => {
  //       const { blob } = res.payload;
  //       const url = window.URL.createObjectURL(new Blob([blob]));
  //       const link = document.body.appendChild(document.createElement("a"));
  //       link.href = url;
  //       link.download = file.originalName || file.name || "download";
  //       link.click();
  //       link.remove();
  //       window.URL.revokeObjectURL(url);
  //     },
  //   );
  // };





  const handleDownloadFile = async (file) => {
  const projectId = file.projectId || project?._id;
  const fileId = file.fileId || file._id;

  if (!projectId || !fileId) {
    toast.error("Missing file identification");
    return;
  }

  const resultAction = await dispatch(
    downloadFile({ projectId, fileId })
  );

  // Request failed
  if (downloadFile.rejected.match(resultAction)) {
    return;
  }

  const blob = resultAction.payload?.blob;

  if (!blob) {
    toast.error("Download failed");
    return;
  }

  const url = window.URL.createObjectURL(
    new Blob([blob])
  );

  const link = document.createElement("a");

  link.href = url;
  link.download =
    file.originalName || file.name || "download";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};
  // const handleDownloadFile = async (file) => {
  //   if (!file?.projectId || !file.fileId) return;

  //   const res = await dispatch(
  //     downloadFile({ projectId: file.projectId, fileId: file.fileId }),
  //   ).then((res) => {
  //     if (res.type === "downloadfile/fulfilled") return;
  //   });

  //   if (res.meta.requestStatus !== "fulfilled") return;

  //   const url = URL.createObjectURL(res.payload.blob);

  //   const a = Object.assign(document.createElement("a"), {
  //     href: url,
  //     download: file.name || "download",
  //   });
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  // const handleDownloadFile = async (file) => {
  //   if (!file?.projectId || !file.fileId) return;

  //   const resultAction = await dispatch(
  //     downloadFile({ projectId: file.projectId, fileId: file.fileId }),
  //   );

  //   if (downloadFile.fulfilled.match(resultAction)) {
  //     const url = URL.createObjectURL(resultAction.payload.blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = file.originalName || "download";
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   } else {
  //     toast.error("Download failed");
  //   }
  // };
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Upload Project Files</h1>
          <p className="card-subtitle">
            Upload your project documents including reports, presentations, and
            code files.
          </p>
        </div>
      </div>

      {/* THE SINGLE GRID DIV FOR ALL THREE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Report Upload Card */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <div className="mb-4">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Report</h3>
          <p className="text-sm text-slate-600 mb-4">
            Upload your project report (PDF, DOC)
          </p>
          <label className="btn-outline cursor-pointer">
            Choose File
            <input
              type="file"
              ref={reportRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFilePick}
              multiple
            />
          </label>
        </div>

        {/* 2. Presentation Upload Card */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <div className="mb-4">
            <Archive className="w-12 h-12 text-slate-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            Presentation
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Upload your presentation slides (PPT, PDF)
          </p>
          <label className="btn-outline cursor-pointer">
            Choose File
            <input
              type="file"
              ref={presRef}
              className="hidden"
              accept=".ppt,.pptx,.pdf"
              onChange={handleFilePick}
              multiple
            />
          </label>
        </div>

        {/* 3. Code Files Upload Card */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <div className="mb-4">
            <FileCode className="w-12 h-12 text-slate-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            Code Files
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Upload your source code (ZIP, RAR, TAR)
          </p>
          <label className="btn-outline cursor-pointer">
            Choose File
            <input
              type="file"
              ref={codeRef}
              className="hidden"
              accept=".zip,.rar,.tar"
              onChange={handleFilePick}
              multiple
            />
          </label>
        </div>
      </div>

      {/* Upload Button Section */}
      <div className="flex justify-end mt-4">
        <button onClick={handleUpload} className="btn-primary">
          Upload Selected Files
        </button>
      </div>

      {/* SELECTED FILES PREVIEW (From your latest images) */}
      {selectedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-lg">Ready to Upload</h2>
          </div>
          <div className="p-4 space-y-3">
            {selectedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="font-medium text-slate-800">{file.name}</p>

                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeSelected(file.name)}
                  className="btn-danger btn-small "
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOADED FILES LIST */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Uploaded Files</h2>
          <p className="card-subtitle">Manage your uploaded project files</p>
        </div>

        {(files || []).length === 0 ? (
          <div className="text-center py-4">
            <FilePlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file._id || file.fileUrl}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.originalName)}
                  <div>
                    <p className="font-medium text-slate-800">
                      {file.originalName}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>{file.fileType || "File"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="btn-outline btn-small"
                    onClick={() => handleDownloadFile(file)}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFiles;
