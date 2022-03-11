const express = require('express');
const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const replayRoutes = require('./routes/replays');

// Middlewares
app.use(express.json());
app.use('/user', authRoutes);
app.use('/replay', replayRoutes);

// Socket server
const startSocketServer = require('./socketServer');

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
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

startSocketServer(server);
