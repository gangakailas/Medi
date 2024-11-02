import React, {useContext, useEffect} from 'react'
import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home";
import Appointment from "./pages/Appointment";
import Online from "./pages/Online";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/footer.jsx";
import axios from "axios";
import { Context } from "./main";


const App = () => {
  const {isAuthenticated, setIsAuthenticated, setUser} = useContext(Context);
  useEffect(()=>{
    const fetchUser = async()=>{
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
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/appointment' element={<Appointment/>}/>   
          <Route path='/online' element={<Online/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
        <Footer/>
        <ToastContainer position="top-center"/>
      </Router>
    </>
  );
};

export default App
