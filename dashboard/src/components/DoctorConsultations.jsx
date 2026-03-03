import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:4000";

const DoctorConsultations = () => {
    const { user } = useContext(Context);
    const [consultations, setConsultations] = useState([]);
    const [patientEmail, setPatientEmail] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [notes, setNotes] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchConsultations = async () => {
        try {
            const { data } = await axios.get(
                `${API_URL}/api/v1/consultation/doctor/my`,
                { withCredentials: true }
            );
            setConsultations(data.consultations);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConsultations();
        const interval = setInterval(fetchConsultations, 15000);
        return () => clearInterval(interval);
    }, []);

    const searchPatient = async (email) => {
        setPatientEmail(email);
        if (email.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            const { data } = await axios.get(
                `${API_URL}/api/v1/user/patients/search?email=${email}`,
                { withCredentials: true }
            );
            setSearchResults(data.patients);
        } catch (err) {
            console.error(err);
        }
    };

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setPatientEmail(patient.email);
        setSearchResults([]);
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedPatient) {
            toast.error("Please select a patient first!");
            return;
        }
        try {
            const { data } = await axios.post(
                `${API_URL}/api/v1/consultation/create`,
                {
                    patientEmail: selectedPatient.email,
                    scheduledDate,
                    scheduledTime,
                    notes,
                },
                { withCredentials: true }
            );
            toast.success(data.message);
            setPatientEmail("");
            setScheduledDate("");
            setScheduledTime("");
            setNotes("");
            setSelectedPatient(null);
            setShowForm(false);
            fetchConsultations();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error scheduling consultation");
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Scheduled": return "status-scheduled";
            case "Active": return "status-active";
            case "Completed": return "status-completed";
            case "Cancelled": return "status-cancelled";
            default: return "";
        }
    };

    return (
        <section className="page doctor-consultations">
            <div className="consultations-top">
                <h1>My Consultations</h1>
                <button
                    className="schedule-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "✕ Close" : "＋ Schedule New"}
                </button>
            </div>

            {showForm && (
                <div className="schedule-form-card">
                    <h3>Schedule a Consultation</h3>
                    <form onSubmit={handleSchedule}>
                        <div className="patient-search-wrapper">
                            <label>Patient Email</label>
                            <input
                                type="text"
                                placeholder="Search patient by email..."
                                value={patientEmail}
                                onChange={(e) => searchPatient(e.target.value)}
                            />
                            {searchResults.length > 0 && (
                                <div className="search-dropdown">
                                    {searchResults.map((p) => (
                                        <div
                                            key={p._id}
                                            className="search-result-item"
                                            onClick={() => selectPatient(p)}
                                        >
                                            <strong>{p.firstName} {p.lastName}</strong>
                                            <span>{p.email}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedPatient && (
                                <div className="selected-patient">
                                    ✓ {selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.email})
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div>
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label>Notes (optional)</label>
                            <textarea
                                placeholder="Add notes for the patient..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <button type="submit" className="confirm-schedule-btn">
                            Schedule Consultation
                        </button>
                    </form>
                </div>
            )}

            <div className="consultations-table-wrapper">
                {consultations.length === 0 ? (
                    <p className="no-data">No consultations yet</p>
                ) : (
                    <table className="consultations-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultations.map((c) => (
                                <tr key={c._id}>
                                    <td>
                                        {c.patient.firstName} {c.patient.lastName}
                                    </td>
                                    <td>{c.scheduledDate}</td>
                                    <td>{c.scheduledTime}</td>
                                    <td>
                                        <span className={`table-badge ${getStatusClass(c.status)}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td>
                                        {(c.status === "Scheduled" || c.status === "Active") && (
                                            <Link
                                                to={`/consultation/${c._id}`}
                                                className="action-btn start-btn"
                                            >
                                                {c.status === "Active" ? "Rejoin" : "Start"}
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
};

export default DoctorConsultations;
