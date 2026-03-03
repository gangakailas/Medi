import React, { useContext, useState } from 'react'
import { Context } from '../main';
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor, FaVideo } from "react-icons/fa6";
import { MdAddModerator } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  const isDoctor = user && user.role === "Doctor";
  const isAdmin = user && user.role === "Admin";

  const gotoHome = () => {
    navigateTo("/");
    setShow(!show);
  };
  const gotoDoctorsPage = () => {
    navigateTo("/doctors");
    setShow(!show);
  };
  const gotoMessagepage = () => {
    navigateTo("/messages");
    setShow(!show);
  };
  const gotoAddNewDoctor = () => {
    navigateTo("/doctor/addnew");
    setShow(!show);
  };
  const gotoAddNewAdmin = () => {
    navigateTo("/admin/addnew");
    setShow(!show);
  };
  const gotoConsultations = () => {
    navigateTo("/consultations");
    setShow(!show);
  };

  const handleLogout = async () => {
    const logoutUrl = isDoctor
      ? "http://localhost:4000/api/v1/user/doctor/logout"
      : "http://localhost:4000/api/v1/user/admin/logout";

    await axios
      .get(logoutUrl, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(false);
        setUser({});
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className={show ? "show sidebar" : "sidebar"}
      >
        <div className="links">
          <TiHome onClick={gotoHome} title="Home" />

          {/* Admin-only links */}
          {isAdmin && (
            <>
              <FaUserDoctor onClick={gotoDoctorsPage} title="Doctors" />
              <MdAddModerator onClick={gotoAddNewAdmin} title="Add Admin" />
              <IoPersonAddSharp onClick={gotoAddNewDoctor} title="Add Doctor" />
              <AiFillMessage onClick={gotoMessagepage} title="Messages" />
            </>
          )}

          {/* Doctor-only links */}
          {isDoctor && (
            <>
              <FaVideo onClick={gotoConsultations} title="My Consultations" />
            </>
          )}

          <RiLogoutBoxFill onClick={handleLogout} title="Logout" />
        </div>
      </nav>
      <div
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className="wrapper"
      >
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  )
}
export default Sidebar