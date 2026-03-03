import express from "express";
import {
    createConsultation,
    getPatientConsultations,
    getDoctorConsultations,
    joinConsultation,
    endConsultation,
    cancelConsultation,
    getChatHistory,
    getConsultation,
} from "../controller/consultationController.js";
import {
    isPatientAuthenticated,
    isDoctorAuthenticated,
    isAnyAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isDoctorAuthenticated, createConsultation);
router.get("/patient/my", isPatientAuthenticated, getPatientConsultations);
router.get("/doctor/my", isDoctorAuthenticated, getDoctorConsultations);
router.get("/chat/:id", isAnyAuthenticated, getChatHistory);
router.put("/join/:id", isAnyAuthenticated, joinConsultation);
router.put("/end/:id", isDoctorAuthenticated, endConsultation);
router.put("/cancel/:id", isDoctorAuthenticated, cancelConsultation);
router.get("/:id", isAnyAuthenticated, getConsultation);

export default router;
