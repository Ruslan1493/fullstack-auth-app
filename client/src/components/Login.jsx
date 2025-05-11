import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/authSlice';
import API from '../api/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const dispatch = useDispatch(); // Initialize Redux dispatch
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/auth/login', { email, password });
            const token = response.data.accessToken;

            // Save token to localStorage
            localStorage.setItem('token', token);

            // Dispatch the login action with the token
            dispatch(login(token));

            setMessage('Login successful!');
            navigate('/homepage');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
