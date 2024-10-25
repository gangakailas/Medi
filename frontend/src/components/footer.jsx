import React from "react";
import { Link } from "react-router-dom";
import {FaPhone, FaLocationArrow} from "react-icons/fa";
import {MdEmail} from "react-icons/md";

const Footer = () => {
  const hours = [
    { id: 1, day: "Monday", time: "9:00 AM - 11:00 PM" },
    { id: 2, day: "Tuesday", time: "12:00 PM - 12:00 AM" },
    { id: 3, day: "Wednesday", time: "10:00 AM - 10:00 PM" },
    { id: 4, day: "Thursday", time: "9:00 AM - 9:00 PM" },
    { id: 5, day: "Friday", time: "3:00 PM - 9:00 PM" },  // Corrected the day from "Monday" to "Friday"
    { id: 6, day: "Saturday", time: "9:00 AM - 3:00 PM" },
  ];

  return (
    <>
      {/* Changed Footer to footer */}
      <footer className="container">
        <hr />
        <div className="content">
          <div>
            <img src="/logoo.png" alt="logo" className="logo-img" />
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to={"/"}>Home</Link></li>
              <li><Link to={"/appointment"}>Appointment</Link></li>
              <li><Link to={"/online"}>Online</Link></li>
            </ul>
          </div>
          <div>
            <h4>Hours</h4>
            <ul>
              {hours.map((element) => {
                return (
                  <li key={element.id}>
                    <span>{element.day}</span> : <span>{element.time}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <div>
              <FaPhone/>
              <span>999-999-999</span>
            </div>
            <div>
              <MdEmail/>
              <span>mediconnect@gmail.com</span>
            </div>
            <div>
              <FaLocationArrow/>
              <span>Kochi, India</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
