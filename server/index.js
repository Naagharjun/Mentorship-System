const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env.local' });

const authRoutes = require('./routes/auth.js');
const requestRoutes = require('./routes/requests.js');
const userRoutes = require('./routes/users.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URL;

if (!MONGO_URI) {
    console.error("MONGO_URL is missing in .env.local!");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT} (accessible on local network)`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });
