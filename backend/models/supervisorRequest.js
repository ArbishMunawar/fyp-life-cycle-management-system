import mongoose from "mongoose";

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Supervisor ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [250, "Feedback message cannot be more than 250 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Indxing for better query performance
supervisorRequestSchema.index({ student: 1 });
supervisorRequestSchema.index({ supervisor: 1 });
supervisorRequestSchema.index({ status: 1 });

export const SupervisorRequest =
  mongoose.model.SupervisorRequest ||
  mongoose.model("SupervisorRequest", supervisorRequestSchema);
