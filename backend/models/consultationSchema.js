import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  doctor: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  patient: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  department: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: String,
    required: [true, "Scheduled date is required"],
  },
  scheduledTime: {
    type: String,
    required: [true, "Scheduled time is required"],
  },
  status: {
    type: String,
    enum: ["Scheduled", "Active", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Consultation = mongoose.model("Consultation", consultationSchema);
