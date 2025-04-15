import React, { useState, useEffect } from 'react';
import API from '../api/api';

const ProtectedPage = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProtectedData = async () => {
            try {
                const response = await API.get('/auth/protected');
                setMessage(response.data.message);
            } catch (err) {
                setMessage(err.response?.data?.error || 'Access denied');
            }
        };

        fetchProtectedData();
    }, []);

    return (
        <div>
            <h2>Protected Page</h2>
            <p>{message}</p>
        </div>
    );
};

export default ProtectedPage;
