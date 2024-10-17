import React from 'react';


const Online = () => {
  return (
    <div className="online-page">
      <h1 className="online-title">Connect with Doctors Online</h1>
      <p className="online-description">
        Get personalized medical consultations from certified doctors without leaving the comfort of your home.
      </p>
      <div className="online-cta">
        <button className="book-appointment-button">Book an Appointment</button>
        <p className="already-booked-text">Already booked a consultation?</p>
        <button className="join-meeting-button">Join the Meeting</button>
      </div>
    </div>
  );
};

export default Online;
