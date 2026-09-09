// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   getTeacherDashboardStat,
//   getPendingProposals,
//   voteOnProposal,
// } from "../../store/slices/teacherSlice";
// import { toast } from "react-toastify";
// import { CheckCircle, Clock, Loader, MoveDiagonal, Users } from "lucide-react";
// const TeacherDashboard = () => {
//   const dispatch = useDispatch();

//   // const { dashboardStats, loading } = useSelector((state) => state.teacher);
//   const { dashboardStats, loading, proposals } = useSelector(
//     (state) => state.teacher,
//   );
//   const { authUser } = useSelector((state) => state.auth);

//   // useEffect(() => {
//   //   dispatch(getTeacherDashboardStat());
//   // }, [dispatch]);

//   useEffect(() => {
//     dispatch(getTeacherDashboardStat());
//     dispatch(getPendingProposals());
//   }, [dispatch]);

//   const statsCards = [
//     {
//       title: "Assigned Students",
//       value: authUser?.assignedStudents?.length || 0,
//       loading,
//       Icon: Users,
//       bg: "bg-blue-100",
//       color: "text-blue-600",
//     },
//     {
//       title: "Pending Requests",
//       value: dashboardStats?.totalPendingRequests || 0,
//       loading,
//       Icon: Clock,
//       bg: "bg-yellow-100",
//       color: "text-yellow-600",
//     },
//     {
//       title: "Completed Projects",
//       value: dashboardStats?.completedProjects || 0,
//       loading,
//       Icon: CheckCircle,
//       bg: "bg-green-100",
//       color: "text-green-600",
//     },
//   ];

//   const handleVote = async (projectId, vote) => {
//   const result = await dispatch(
//     voteOnProposal({
//       projectId,
//       vote,
//     })
//   );

//   if (voteOnProposal.fulfilled.match(result)) {
//     toast.success(
//       vote === "approve"
//         ? "Proposal approved successfully"
//         : "Proposal rejected successfully"
//     );

//     dispatch(getPendingProposals());
//   } else {
//     toast.error(result.payload || "Failed to submit vote");
//   }
// };

//   return (
//     <>
//       <div className="space-y-6">
//         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
//           <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
//           <p className="text-green-100">
//             Manage your students and provide guidance on their projects.
//           </p>
//         </div>

//         {/* STATS CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {statsCards.map(
//             ({ title, value, loading, Icon, bg, color }, index) => {
//               return (
//                 <div key={index} className={`card`}>
//                   <div className="flex items-center">
//                     <div className={`p-3 ${bg} rounded-lg`}>
//                       <Icon className={`w-6 h-6 ${color}`} />
//                     </div>

//                     <div className="ml-4">
//                       <p className={`text-sm font-medium text-slate-600`}>
//                         {title}
//                       </p>
//                       <p className={`text-sm font-medium text-slate-800`}>
//                         {loading ? "..." : value}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             },
//           )}
//         </div>

//         {/* RECENT ACTIVITY */}
//         {/* <div className="card">
//           <div className="card-header">
//             <h2 className="card-title">Recent Activity</h2>
//             <p className="card-subtitle">Latest notifications and updates</p>
//           </div>

//           <div className="space-y-4">
//             {loading ? (
//               <Loader size={32} className="animate-spin" />
//             ) : dashboardStats?.recentNotifications?.length > 0 ? (
//               dashboardStats.recentNotifications.map((notification) => {
//                 return (
//                   <div
//                     key={notification._id}
//                     className="flex items-center p-3 bg-slate-50 rounded-lg"
//                   >
//                     <div className="p-2 bg-white rounded-lg text-slate-600">
//                       <MoveDiagonal className="w-5 h-5" />
//                     </div>

//                     <div className="ml-3 flex-1">
//                       <p className="text-sm text-slate-800">
//                         {notification.message}
//                       </p>
//                       <p className="text-xs text-slate-500">
//                         {new Date(notification.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="text-center py-4 text-slate-500">
//                 No recent activity
//               </div>
//             )}
//           </div>
//         </div> */}

//         <div className="card">
//           <div className="card-header">
//             <h2 className="card-title">Pending Proposal Reviews</h2>
//             <p className="card-subtitle">Review student proposals</p>
//           </div>

//           <div className="space-y-4">
//             {proposals?.length > 0 ? (
//               proposals.map((proposal) => (
//                 <div key={proposal._id} className="border rounded-lg p-4">
//                   <h3 className="font-semibold text-lg">{proposal.title}</h3>

//                   <p className="text-sm text-slate-500">
//                     Student: {proposal.student?.name}
//                   </p>

//                   <p className="mt-2 text-sm">{proposal.description}</p>

//                   <div className="flex gap-3 mt-4">
//                     <button
//                       onClick={() => handleVote(proposal._id, "approve")}
//                       className="px-4 py-2 bg-green-600 text-white rounded"
//                     >
//                       Approve
//                     </button>

//                     <button
//                       onClick={() => handleVote(proposal._id, "reject")}
//                       className="px-4 py-2 bg-red-600 text-white rounded"
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-4 text-slate-500">
//                 No proposals awaiting review
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RECENT ACTIVITY */}
//         <div className="card">
//           <div className="card-header">
//             <h2 className="card-title">Recent Requests</h2>
//             <p className="card-subtitle">
//               Latest supervisor requests from students
//             </p>
//           </div>

//           <div className="space-y-4">
//             {loading ? (
//               <Loader size={32} className="animate-spin" />
//             ) : dashboardStats?.recentRequests?.length > 0 ? (
//               dashboardStats.recentRequests.map((request) => {
//                 return (
//                   <div
//                     key={request._id}
//                     className="flex items-center p-3 bg-slate-50 rounded-lg"
//                   >
//                     <div className="p-2 bg-white rounded-lg text-slate-600">
//                       <Users className="w-5 h-5" />
//                     </div>

//                     <div className="ml-3 flex-1">
//                       <p className="text-sm text-slate-800">
//                         <span className="font-semibold">
//                           {request.student?.name}
//                         </span>{" "}
//                         requested supervision
//                       </p>

//                       <p className="text-sm text-slate-600">
//                         {request.message}
//                       </p>

//                       <p className="text-xs text-slate-500">
//                         {new Date(request.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="text-center py-4 text-slate-500">
//                 No recent requests
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default TeacherDashboard;




import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTeacherDashboardStat,
  getPendingProposals,
  voteOnProposal,
} from "../../store/slices/teacherSlice";
import { toast } from "react-toastify";
import { CheckCircle, Clock, Loader, MoveDiagonal, Users } from "lucide-react";
const TeacherDashboard = () => {
  const dispatch = useDispatch();

  // const { dashboardStats, loading } = useSelector((state) => state.teacher);
  const { dashboardStats, loading, proposals } = useSelector(
    (state) => state.teacher,
  );
  const { authUser } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   dispatch(getTeacherDashboardStat());
  // }, [dispatch]);

  useEffect(() => {
    dispatch(getTeacherDashboardStat());
    dispatch(getPendingProposals());
  }, [dispatch]);

  const statsCards = [
    {
      title: "Assigned Students",
      value: authUser?.assignedStudents?.length || 0,
      loading,
      Icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      Icon: Clock,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      Icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  const handleVote = async (projectId, vote) => {
  const result = await dispatch(
    voteOnProposal({
      projectId,
      vote,
    })
  );

  if (voteOnProposal.fulfilled.match(result)) {
    toast.success(
      vote === "approve"
        ? "Proposal approved successfully"
        : "Proposal rejected successfully"
    );

    dispatch(getPendingProposals());
  } else {
    toast.error(result.payload || "Failed to submit vote");
  }
};

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-green-100">
            Manage your students and provide guidance on their projects.
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map(
            ({ title, value, loading, Icon, bg, color }, index) => {
              return (
                <div key={index} className={`card`}>
                  <div className="flex items-center">
                    <div className={`p-3 ${bg} rounded-lg`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>

                    <div className="ml-4">
                      <p className={`text-sm font-medium text-slate-600`}>
                        {title}
                      </p>
                      <p className={`text-sm font-medium text-slate-800`}>
                        {loading ? "..." : value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* RECENT ACTIVITY */}
        {/* <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <p className="card-subtitle">Latest notifications and updates</p>
          </div>

          <div className="space-y-4">
            {loading ? (
              <Loader size={32} className="animate-spin" />
            ) : dashboardStats?.recentNotifications?.length > 0 ? (
              dashboardStats.recentNotifications.map((notification) => {
                return (
                  <div
                    key={notification._id}
                    className="flex items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="p-2 bg-white rounded-lg text-slate-600">
                      <MoveDiagonal className="w-5 h-5" />
                    </div>

                    <div className="ml-3 flex-1">
                      <p className="text-sm text-slate-800">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-slate-500">
                No recent activity
              </div>
            )}
          </div>
        </div> */}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Proposal Reviews</h2>
            <p className="card-subtitle">Review student proposals</p>
          </div>

          <div className="space-y-4">
            {proposals?.length > 0 ? (
              proposals.map((proposal) => (
                <div key={proposal._id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{proposal.title}</h3>

                  <p className="text-sm text-slate-500">
                    Student: {proposal.student?.name}
                  </p>

                  <p className="mt-2 text-sm">{proposal.description}</p>

                  {proposal.myVote ? (
                    <div
                      className={`mt-4 inline-block px-3 py-1.5 rounded text-sm font-medium ${
                        proposal.myVote === "approve"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      You {proposal.myVote === "approve" ? "approved" : "rejected"} this proposal
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleVote(proposal._id, "approve")}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleVote(proposal._id, "reject")}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500">
                No proposals awaiting review
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Requests</h2>
            <p className="card-subtitle">
              Latest supervisor requests from students
            </p>
          </div>

          <div className="space-y-4">
            {loading ? (
              <Loader size={32} className="animate-spin" />
            ) : dashboardStats?.recentRequests?.length > 0 ? (
              dashboardStats.recentRequests.map((request) => {
                return (
                  <div
                    key={request._id}
                    className="flex items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="p-2 bg-white rounded-lg text-slate-600">
                      <Users className="w-5 h-5" />
                    </div>

                    <div className="ml-3 flex-1">
                      <p className="text-sm text-slate-800">
                        <span className="font-semibold">
                          {request.student?.name}
                        </span>{" "}
                        requested supervision
                      </p>

                      <p className="text-sm text-slate-600">
                        {request.message}
                      </p>

                      <p className="text-xs text-slate-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-slate-500">
                No recent requests
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
