require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

const app = express();

// Trust proxy is REQUIRED for Render to set secure cookies properly
app.set('trust proxy', 1);

// Enable CORS with credentials
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for hackathon
    }
  },
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

// Configure Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Required for cross-site cookies
    sameSite: 'none', // Required for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const storeRoutes = require('./routes/storeRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Express server is running' });
});

// Connect to Database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
