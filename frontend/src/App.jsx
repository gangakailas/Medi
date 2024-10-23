import React from 'react'
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
import Footer from "./components/Footer.jsx";
import { useEffect, useContext } from 'react';
import axios from "axios";
import { Context } from "./main";


const App = () => {
  const {isAuthenticated, setIsAuthenticated, setUser} = useContext(Context);
  useEffect(()=>{
    const fetchUser = async()=>{
      try {
        const response = await axios.get("", {withCredentials: true});
        setIsAuthenticated(false);
        setUser(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser([]);
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
        <footer/>
        <ToastContainer position="top-center"/>
      </Router>
    </>
  )
}

export default App
