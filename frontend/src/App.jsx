import React, { useContext, useEffect, Suspense } from 'react'
import "./App.css"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home";
import Appointment from "./pages/Appointment";
import Online from "./pages/Online";
const ConsultationRoom = React.lazy(() => import("./pages/ConsultationRoom"));
import Register from "./pages/Register";
import Login from "./pages/Login";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/footer.jsx";
import axios from "axios";
import { Context } from "./main";

const AppLayout = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const location = useLocation();
  const isConsultationPage = location.pathname.startsWith("/consultation/");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/patient/me",
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

  return (
    <>
      {!isConsultationPage && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/appointment' element={<Appointment />} />
        <Route path='/online' element={<Online />} />
        <Route path='/consultation/:id' element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
            <ConsultationRoom />
          </Suspense>
        } />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
      </Routes>
      {!isConsultationPage && <Footer />}
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


