// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import {
//   toggleStudentModal,
//   toggleTeacherModal,
// } from "../../store/slices/popupSlice";
// import { X } from "lucide-react";
// import { createStudent, createTeacher } from "../../store/slices/adminSlice";

// const AddTeacher = () => {
//   const dispatch = useDispatch();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     department: "",
//     password: "",
//     experties: "",
//     maxStudents: 100,
//   });

//   const handleCreateTeacher = (e) => {
//     e.preventDefault();
//     dispatch(createTeacher(formData));
//     setFormData({
//       name: "",
//       email: "",
//       department: "",
//       password: "",
//       experties: "",
//       maxStudents: 100,
//     });
//     dispatch(toggleTeacherModal());
//   };

//   return (
//     <>
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-slate-900">
//               Add Teacher
//             </h3>
//             <button
//               onClick={() => dispatch(toggleTeacherModal())}
//               className="text-slate-400 hover:text-slate-600"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//           {/* Content for the modal would go here */}

//           <form onSubmit={handleCreateTeacher} className="space-y-4">
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

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Experties
//               </label>

//               <select
//                 className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
//                 required
//                 value={formData.experties}
//                 onChange={(e) =>
//                   setFormData({ ...formData, experties: e.target.value })
//                 }
//               >
//                 <option value="">Select Area of Experties</option>
//                 <option value="Artificial Intelligence">
//                   Artificial Intelligence
//                 </option>
//                 <option value="Machine Learning">Machine Learning</option>
//                 <option value="Data Science">Data Science</option>
//                 <option value="Cybersecurity">Cybersecurity</option>
//                 <option value="Cloud Computing">Cloud Computing</option>
//                 <option value="Software Development">
//                   Software Development
//                 </option>
//                 <option value="Web Development">Web Development</option>
//                 <option value="Mobile App Development">
//                   Mobile App Development
//                 </option>
//                 <option value="Database Systems">Database Systems</option>
//                 <option value="Computer Networks">Computer Networks</option>
//                 <option value="Operating Systems">Operating Systems</option>
//                 <option value="Human-Computer Interaction">
//                   Human-Computer Interaction
//                 </option>
//                 <option value="Big Data Analytics">Big Data Analytics</option>
//                 <option value="Blockchain Technology">
//                   Blockchain Technology
//                 </option>
//                 <option value="Internet of Things (IoT)">
//                   Internet of Things (IoT)
//                 </option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Max Students
//               </label>
//               <input
//                 type="number"
//                 required
//                 // max={100}
//                 min={1}
//                 value={formData.maxStudents}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     maxStudents: e.target.value,
//                   })
//                 }
//                 className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
//               />
//             </div>

//             <div className="flex justify-end space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={() => dispatch(toggleTeacherModal())}
//                 className="btn-danger"
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="btn-primary">
//                 Add Teacher
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AddTeacher;


// src/components/modal/AddTeacher.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { X } from "lucide-react";
import { createTeacher } from "../../store/slices/adminSlice";

const DEPARTMENTS = [
  { value: "CS Morning", label: "Computer Science (Morning)" },
  { value: "CS Evening", label: "Computer Science (Evening)" },
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "Information Technology", label: "Information Technology" },
];

const EXPERTISE_OPTIONS = [
  "Artificial Intelligence", "Machine Learning", "Data Science",
  "Cybersecurity", "Cloud Computing", "Software Development",
  "Web Development", "Mobile App Development", "Database Systems",
  "Computer Networks", "Operating Systems", "Human-Computer Interaction",
  "Big Data Analytics", "Blockchain Technology", "Internet of Things (IoT)",
];

const AddTeacher = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    registrationNumber: "",   // ← NEW FIELD
    experties: "",
    maxStudents: 10,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTeacher = (e) => {
    e.preventDefault();
    dispatch(createTeacher(formData));
    setFormData({
      name: "", email: "", department: "", password: "",
      registrationNumber: "", experties: "", maxStudents: 10,
    });
    dispatch(toggleTeacherModal());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Add Teacher</h3>
          <button onClick={() => dispatch(toggleTeacherModal())} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleCreateTeacher} className="space-y-4">
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
              Registration / Employee Number
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
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Area of Expertise</label>
            <select
              name="experties"
              required
              value={formData.experties}
              onChange={handleChange}
              className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
            >
              <option value="">Select Expertise</option>
              {EXPERTISE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Students</label>
            <input
              type="number"
              name="maxStudents"
              required
              min={1}
              value={formData.maxStudents}
              onChange={handleChange}
              className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => dispatch(toggleTeacherModal())} className="btn-danger">
              Cancel
            </button>
            <button type="submit" className="btn-primary">Add Teacher</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacher;
