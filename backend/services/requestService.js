import { SupervisorRequest } from "../models/supervisorRequest.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";

export const createRequest = async (requestData) => {
  const exisitingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (exisitingRequest) {
    throw new Error(
      "You have already sent a request to this supervisor. Please wait for their response.",
    );
  }

  const request = await SupervisorRequest.create(requestData);
  return await request.save();
};

export const getAllRequests = async (filters) => {
  const requests = await SupervisorRequest.find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await SupervisorRequest.countDocuments(filters);

  return { requests, total };
};


export const acceptRequests = async (requestId, teacherId) => {
  const request = await SupervisorRequest.findByIdAndUpdate(
    requestId,
    { status: "accepted" },
    { new: true }
  ).populate("student supervisor");

  if (!request) return null;

  // ✅ THIS IS MISSING — update the project's supervisor field
  await Project.findOneAndUpdate(
    { student: request.student._id },
    { supervisor: teacherId },
    { new: true }
  );

  // ✅ THIS IS ALSO MISSING — update student's supervisor field
  await User.findByIdAndUpdate(request.student._id, {
    supervisor: teacherId
  });

  return request;
};
export const rejectRequest = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email")
    .populate("supervisor", "name email");

  if (!request) throw new Error("Request not found");

  if (request.supervisor._id.toString() !== supervisorId.toString() ) {
    throw new Error("Not authorized to reject this request");
  }

  if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }

  request.status = "rejected";
  await request.save();

  return request;
};
