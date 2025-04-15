import axios from 'axios';
import { initializeAuth } from './authSlice';
import API from '../api/api';

export const initializeAuthState = async (dispatch) => {
    const token = localStorage.getItem('token');
    console.log('🌐 Initializing auth state with token:', token); // log the token

    if (token) {
        try {
            const response = await API.post('/auth/validate-token', { token });
            console.log('✅ Token validated, user:', response.data.user); // log response

            if (response.data.valid) {
                const user = response.data.user; // Get user info from the server
                dispatch(initializeAuth({ token, user }));
            } else {
                localStorage.removeItem('token'); // Remove invalid token
            }
        } catch (err) {
            console.error('🚨 Token validation failed:', err.response?.data || err.message);

            console.error('Token validation failed:', err);
            localStorage.removeItem('token'); // Remove invalid token
        }
    }
};