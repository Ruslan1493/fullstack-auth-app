// import axios from 'axios';

// const API = axios.create({
//     baseURL: 'http://localhost:5000', // Replace with your backend URL
// });

// // Automatically include token in headers if available
// API.interceptors.request.use((req) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         req.headers.Authorization = `Bearer ${token}`;
//     }
//     return req;
// });

// export default API;

// //------------

import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true // Important for cookies!
});

// Add access token to requests
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Auto-refresh token on 401
API.interceptors.response.use(
    res => res,
    async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post('http://localhost:5000/auth/refresh-token', {}, {
                    withCredentials: true
                });
                const newToken = res.data.accessToken;
                localStorage.setItem('token', newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return API(originalRequest);
            } catch (refreshErr) {
                console.error("Refresh failed:", refreshErr);
            }
        }
        return Promise.reject(err);
    }
);

export default API;
