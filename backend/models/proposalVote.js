import mongoose from "mongoose";

const proposalVoteSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vote: {
      type: String,
      enum: ["approve", "reject"],
      required: true,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

proposalVoteSchema.index({ project: 1, teacher: 1 }, { unique: true });

export const ProposalVote =
  mongoose.models.ProposalVote ||
  mongoose.model("ProposalVote", proposalVoteSchema);