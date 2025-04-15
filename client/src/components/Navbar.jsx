import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import style from './Navbar.module.scss';

const Navbar = () => {
    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(logout());
    };

    return (
        <nav className={style.navigation}>
            {isLoggedIn ? (
                <>
                    <span>Welcome, {user?.name || 'User'}!</span>
                    <Link to="/homepage" className={style.nav_element}>Homepage</Link>
                    <Link to="/protected" className={style.nav_element}>Protected</Link>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login" className={style.nav_element}>Login</Link>
                    <Link to="/register" className={style.nav_element}>Register</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;
