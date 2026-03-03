import React, { useContext, useEffect, Suspense } from 'react';
import "./App.css"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Messages from "./components/Messages";
import AddNewDoctor from "./components/AddNewDoctor";
import AddNewAdmin from "./components/AddNewAdmin";
import Doctors from "./components/Doctors";
import DoctorConsultations from "./components/DoctorConsultations";
const DoctorChatRoom = React.lazy(() => import("./components/DoctorChatRoom"));
import Sidebar from "./components/Sidebar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Context } from './main';
import axios from "axios";

const AppLayout = () => {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const location = useLocation();
  const isConsultationPage = location.pathname.startsWith("/consultation/");

  useEffect(() => {
    const fetchUser = async () => {
      // Try admin first, then doctor
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/admin/me",
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setUser(response.data.user);
        return;
      } catch (error) {
        // Not an admin, try doctor
      }

      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/doctor/me",
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setUser(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  const isDoctor = user && user.role === "Doctor";
  const isAdmin = user && user.role === "Admin";

  return (
    <>
      {!isConsultationPage && <Sidebar />}
      <Routes>
        <Route path='/login' element={<Login />} />

        {/* Admin Routes */}
        {isAdmin && (
          <>
            <Route path='/' element={<Dashboard />} />
            <Route path='/doctor/addnew' element={<AddNewDoctor />} />
            <Route path='/admin/addnew' element={<AddNewAdmin />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/doctors' element={<Doctors />} />
          </>
        )}

        {/* Doctor Routes */}
        {isDoctor && (
          <>
            <Route path='/' element={<DoctorConsultations />} />
            <Route path='/consultations' element={<DoctorConsultations />} />
            <Route path='/consultation/:id' element={
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>Loading...</div>}>
                <DoctorChatRoom />
              </Suspense>
            } />
          </>
        )}

        {/* Fallback for unauthenticated */}
        {!isAuthenticated && (
          <Route path='*' element={<Login />} />
        )}
      </Routes>
      <ToastContainer position="top-center" />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App