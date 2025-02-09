import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext';
import { doSignOut } from '../../auth';
import { Spin as Hamburger } from 'hamburger-react'
import './Navbar.css'
import star from '../../assets/ui/star.png'

const Navbar = ({ handleSwitchToLogin, handleSwitchToRegister }) => {
    const { userLoggedIn, currentUser } = useAuth();
    const [isOpen, setOpen] = useState();
    
    const navigate = useNavigate();

    const toggleMenu = () => {
      setOpen(!isOpen);
    };


    const handleLogout = () => {
        doSignOut().then(() => {
            navigate('/');
        });
    };

    useEffect(() => {
        const handleResize = () => {
            setOpen();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleNavHome = () => {
        navigate('/')
    }


    return (
        <nav className='fade-in-fwd'>
            <div className="menu-icon">
                <Hamburger 
                    toggled={isOpen} 
                    toggle={setOpen} 
                    size={24} 
                    duration={0.5}
                    color="#FFFFFF"
                    easing="ease-in"
                />
            </div>
            <div className={`menu blur ${isOpen === true ? 'slide-in-right' : isOpen === false ? 'slide-out-right' : ''}`} >
                <ul>
                    <li>
                        <Link to='/' onClick={toggleMenu}>Home</Link>
                    </li>
                    <li>
                        na
                    </li>
                </ul>
                <div className="logo" onClick={handleNavHome}>
                    <img src={star} alt="" />
                    <h1>Zoevestica</h1>
                    <img src={star} alt="" />
                </div>
                <ul>
                    {userLoggedIn ? (
                        <>
                            <li>
                                <Link to='/journal' >Journal</Link>
                            </li>
                            <li onClick={handleLogout}>
                                Logout
                            </li>
                        </>
                    ) : (
                        <>
                            <li onClick={handleSwitchToLogin}>
                                Login
                            </li>
                            <li onClick={handleSwitchToRegister}>
                                Register
                            </li>
                        </>
                    )}
                </ul>
                <p className='mobile'>&copy; Designed and developed by Jackie Shen | All rights reserved</p>
            </div>

        
        </nav>
    );
};

export default Navbar;
