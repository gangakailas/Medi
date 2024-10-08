import React from 'react'
import { Context } from '../main'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [show, setShow] = useStae(false)
  const {} = useContext(Context)

    const handeLogout = async()=>{
        try {
            await axios.get("", { withCredentials: true});
        } catch (error) {
            
        }
    }
    const gotoLogin = () => {};

  return (
    <nav className='container'>
        <div className="logo">MediConnect</div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
            <div className="links">
                <Link to={"/"}>HOME</Link>
                <Link to={"/appointment"}>BOOK APPOINTMENT</Link>
                <Link to={"/online"}>ONLINE CONSULTATION</Link>
            </div>
            {isAuthenticated ? (
                <button className="logoutBtn btn" onClick={(handleLogout)=>}>
                    LOGOUT
                </button>
            ) : (
                <button className="logoutBtn btn" onClick={(gotoLogin)}>
                    LOGIN
                </button>
            )}
        </div>
    </nav>
  )
}

export default Navbar
