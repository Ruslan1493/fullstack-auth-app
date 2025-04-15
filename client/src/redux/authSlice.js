import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false,
        token: null,
    },
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = true;
            state.token = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.token = null;
        },
        initializeAuth: (state, action) => {
            state.isLoggedIn = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
    },
});

export const { login, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;