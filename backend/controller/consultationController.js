import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Consultation } from "../models/consultationSchema.js";
import { ChatMessage } from "../models/chatMessageSchema.js";
import { User } from "../models/userSchema.js";
import crypto from "crypto";

// Doctor creates a consultation for a patient
export const createConsultation = catchAsyncErrors(async (req, res, next) => {
    const { patientEmail, scheduledDate, scheduledTime, notes } = req.body;

    if (!patientEmail || !scheduledDate || !scheduledTime) {
        return next(
            new ErrorHandler("Please provide patient email, date, and time!", 400)
        );
    }

    const patient = await User.findOne({ email: patientEmail, role: "Patient" });
    if (!patient) {
        return next(new ErrorHandler("Patient not found with this email!", 404));
    }

    const doctor = req.user;
    const roomId = crypto.randomBytes(16).toString("hex");

    const consultation = await Consultation.create({
        doctorId: doctor._id,
        patientId: patient._id,
        doctor: {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
        },
        patient: {
            firstName: patient.firstName,
            lastName: patient.lastName,
        },
        department: doctor.doctorDepartment,
        scheduledDate,
        scheduledTime,
        roomId,
        notes: notes || "",
    });

    res.status(200).json({
        success: true,
        message: "Consultation scheduled successfully!",
        consultation,
    });
});

// Patient gets their consultations (inbox)
export const getPatientConsultations = catchAsyncErrors(
    async (req, res, next) => {
        const consultations = await Consultation.find({
            patientId: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            consultations,
        });
    }
);

// Doctor gets their consultations
export const getDoctorConsultations = catchAsyncErrors(
    async (req, res, next) => {
        const consultations = await Consultation.find({
            doctorId: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            consultations,
        });
    }
);

// Join a consultation (mark as Active)
export const joinConsultation = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);

    if (!consultation) {
        return next(new ErrorHandler("Consultation not found!", 404));
    }

    // Verify user is part of this consultation
    const userId = req.user._id.toString();
    if (
        consultation.doctorId.toString() !== userId &&
        consultation.patientId.toString() !== userId
    ) {
        return next(
            new ErrorHandler("You are not authorized for this consultation!", 403)
        );
    }

    if (consultation.status === "Completed") {
        return next(new ErrorHandler("This consultation has already ended!", 400));
    }

    if (consultation.status === "Cancelled") {
        return next(new ErrorHandler("This consultation was cancelled!", 400));
    }

    // Mark as active if it's still scheduled
    if (consultation.status === "Scheduled") {
        consultation.status = "Active";
        await consultation.save();
    }

    res.status(200).json({
        success: true,
        consultation,
    });
});

// End a consultation (mark as Completed)
export const endConsultation = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);

    if (!consultation) {
        return next(new ErrorHandler("Consultation not found!", 404));
    }

    consultation.status = "Completed";
    await consultation.save();

    res.status(200).json({
        success: true,
        message: "Consultation ended successfully!",
    });
});

// Cancel a consultation
export const cancelConsultation = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);

    if (!consultation) {
        return next(new ErrorHandler("Consultation not found!", 404));
    }

    consultation.status = "Cancelled";
    await consultation.save();

    res.status(200).json({
        success: true,
        message: "Consultation cancelled!",
    });
});

// Get chat history for a consultation
export const getChatHistory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);

    if (!consultation) {
        return next(new ErrorHandler("Consultation not found!", 404));
    }

    // Verify user is part of this consultation
    const userId = req.user._id.toString();
    if (
        consultation.doctorId.toString() !== userId &&
        consultation.patientId.toString() !== userId
    ) {
        return next(new ErrorHandler("Not authorized!", 403));
    }

    const messages = await ChatMessage.find({
        consultationId: id,
    }).sort({ timestamp: 1 });

    res.status(200).json({
        success: true,
        messages,
    });
});

// Get a single consultation by ID
export const getConsultation = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);

    if (!consultation) {
        return next(new ErrorHandler("Consultation not found!", 404));
    }

    const userId = req.user._id.toString();
    if (
        consultation.doctorId.toString() !== userId &&
        consultation.patientId.toString() !== userId
    ) {
        return next(new ErrorHandler("Not authorized!", 403));
    }

    res.status(200).json({
        success: true,
        consultation,
    });
});
