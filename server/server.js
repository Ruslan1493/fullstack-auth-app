require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const helmet = require('helmet');

const app = express();

// Connect Database
connectDB();
// test 2
// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use('/auth', require('./routes/auth'));

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
