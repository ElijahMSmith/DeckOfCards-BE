const express = require('express');
const app = express();

// Import routes
const authRoutes = require('./routes/auth');

// Middlewares
app.use(express.json());
app.use('/api/user', authRoutes);

// Connect to DB
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(
    process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => console.log('connected to db')
);

// Start on port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
