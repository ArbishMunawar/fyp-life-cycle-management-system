// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { toggleStudentModal } from "../../store/slices/popupSlice";
// import { X } from "lucide-react";
// import { createStudent } from "../../store/slices/adminSlice";

// const AddStudent = () => {
//   const dispatch = useDispatch();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     department: "",
//     password: "",
//   });

//   const handleCreateStudent = (e) => {
//     e.preventDefault();
//     dispatch(createStudent(formData));
//     setFormData({ name: "", email: "", department: "", password: "" });
//     dispatch(toggleStudentModal())
//   };

//   return (
//     <>
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-slate-900">
//               Add Student
//             </h3>
//             <button
//               onClick={() => dispatch(toggleStudentModal())}
//               className="text-slate-400 hover:text-slate-600"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//           {/* Content for the modal would go here */}

//           <form onSubmit={handleCreateStudent} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={(e) =>
//                   setFormData({ ...formData, password: e.target.value })
//                 }
//                 className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Department
//               </label>

//               <select
//                 className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
//                 required
//                 value={formData.department}
//                 onChange={(e) =>
//                   setFormData({ ...formData, department: e.target.value })
//                 }
//               >
//                 <option value="">Select Department</option>

//                 {/* Computer Science Options */}
//                 <option value="CS Morning">Computer Science (Morning)</option>
//                 <option value="CS Evening">Computer Science (Evening)</option>

//                 {/* Other Requested Departments */}
//                 <option value="Software Engineering">
//                   Software Engineering
//                 </option>
//                 <option value="Information Technology">
//                   Information Technology
//                 </option>
//               </select>
//             </div>

//             <div className="flex justify-end space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={() => dispatch(toggleStudentModal())}
//                 className="btn-danger"
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="btn-primary">
//                 Add Student
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AddStudent;


// src/components/modal/AddStudent.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import { X } from "lucide-react";
import { createStudent } from "../../store/slices/adminSlice";

const AddStudent = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    registrationNumber: "",   // ← NEW FIELD
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    dispatch(createStudent(formData));
    setFormData({ name: "", email: "", department: "", password: "", registrationNumber: "" });
    dispatch(toggleStudentModal());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add Student</h3>
          <button onClick={() => dispatch(toggleStudentModal())} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleCreateStudent} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Registration Number — NEW */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              required
              placeholder="e.g. 2022-ag-2001"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
            >
              <option value="">Select Department</option>
              <option value="CS Morning">Computer Science (Morning)</option>
              <option value="CS Evening">Computer Science (Evening)</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => dispatch(toggleStudentModal())} className="btn-danger">
              Cancel
            </button>
            <button type="submit" className="btn-primary">Add Student</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;