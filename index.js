const express = require('express');
const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const replayRoutes = require('./routes/replays');

// Middlewares
app.use(express.json());
app.use('/user', authRoutes);
// TODO: enable and tests once hosting and other higher priorities are resolved
// app.use('/replay', replayRoutes);

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
    () => console.log('Connected to db')
);

// Start on port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
