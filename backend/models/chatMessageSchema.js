import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    consultationId: {
        type: mongoose.Schema.ObjectId,
        ref: "Consultation",
        required: true,
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    senderRole: {
        type: String,
        enum: ["Doctor", "Patient"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
