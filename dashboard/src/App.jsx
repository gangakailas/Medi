import React, { useContext, useEffect } from 'react';
import "./App.css"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Messages from "./components/Messages";
import AddNewDoctor from "./components/AddNewDoctor";
import AddNewAdmin from "./components/AddNewAdmin";
import Doctors from "./components/Doctors";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Context } from './main';
import axios from "axios";


const App = () => {

  const {isAuthenticated, setIsAuthenticated, user, setUser} = useContext(Context);

  useEffect(()=>{
    const fetchUser = async()=>{
      try {
        const response = await axios.get("", {withCredentials: true});
        setIsAuthenticated(true);
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
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
