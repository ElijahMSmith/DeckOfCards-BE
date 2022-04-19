// Socket server
import startSocketServer from './socketServer';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// Import routes
import authRoutes from './routes/auth';
import replayRoutes from './routes/replays';

// Middlewares
app.use(express.json());
app.use('/user', authRoutes);
app.use('/replay', replayRoutes);

// Connect to DB
import mongoose = require('mongoose');
import dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.DB_CONNECT, () => console.log('Connected to db'));

// Start on port
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

startSocketServer(server);
