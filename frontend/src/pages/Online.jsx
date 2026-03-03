import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Online = () => {
  const { isAuthenticated } = useContext(Context);
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [activeTab, setActiveTab] = useState("doctors");
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors"
        );
        setDoctors(data.doctors);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchConsultations = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/consultation/patient/my",
          { withCredentials: true }
        );
        setConsultations(data.consultations);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConsultations();
    const interval = setInterval(fetchConsultations, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Scheduled": return "badge-scheduled";
      case "Active": return "badge-active";
      case "Completed": return "badge-completed";
      case "Cancelled": return "badge-cancelled";
      default: return "";
    }
  };

  return (
    <div className="online-page-new container">
      <div className="online-hero">
        <h1>Online Consultations</h1>
        <p>
          Connect with certified doctors from the comfort of your home through
          secure video and text chat.
        </p>
      </div>

      <div className="online-tabs">
        <button
          className={`tab-btn ${activeTab === "doctors" ? "active" : ""}`}
          onClick={() => setActiveTab("doctors")}
        >
          Available Doctors
        </button>
        <button
          className={`tab-btn ${activeTab === "inbox" ? "active" : ""}`}
          onClick={() => setActiveTab("inbox")}
        >
          My Consultations
          {consultations.filter((c) => c.status === "Scheduled" || c.status === "Active").length > 0 && (
            <span className="notification-dot"></span>
          )}
        </button>
      </div>

      {activeTab === "doctors" && (
        <div className="doctors-grid">
          {doctors.length === 0 ? (
            <p className="empty-state">No doctors available at the moment.</p>
          ) : (
            doctors.map((doc) => (
              <div className="doctor-card" key={doc._id}>
                <div className="doctor-avatar">
                  {doc.docAvatar?.url ? (
                    <img src={doc.docAvatar.url} alt={doc.firstName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {doc.firstName[0]}
                      {doc.lastName[0]}
                    </div>
                  )}
                </div>
                <div className="doctor-info">
                  <h3>
                    Dr. {doc.firstName} {doc.lastName}
                  </h3>
                  <span className="department-tag">
                    {doc.doctorDepartment}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "inbox" && (
        <div className="consultations-list">
          {!isAuthenticated ? (
            <div className="login-prompt">
              <p>Please log in to view your consultations.</p>
              <button
                className="btn purple-btn"
                onClick={() => navigateTo("/login")}
              >
                Login
              </button>
            </div>
          ) : consultations.length === 0 ? (
            <p className="empty-state">
              No consultations yet. A doctor will schedule one for you.
            </p>
          ) : (
            consultations.map((c) => (
              <div className="consultation-card" key={c._id}>
                <div className="consultation-left">
                  <h4>
                    Dr. {c.doctor.firstName} {c.doctor.lastName}
                  </h4>
                  <span className="department-tag">{c.department}</span>
                  <p className="consultation-datetime">
                    📅 {c.scheduledDate} &nbsp; 🕐 {c.scheduledTime}
                  </p>
                  {c.notes && (
                    <p className="consultation-notes">📝 {c.notes}</p>
                  )}
                </div>
                <div className="consultation-right">
                  <span
                    className={`status-badge ${getStatusBadgeClass(c.status)}`}
                  >
                    {c.status}
                  </span>
                  {(c.status === "Scheduled" || c.status === "Active") && (
                    <Link
                      to={`/consultation/${c._id}`}
                      className="join-btn"
                    >
                      {c.status === "Active" ? "Join Now" : "Enter Room"}
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Online;
