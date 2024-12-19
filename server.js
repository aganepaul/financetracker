const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv'); // For environment variables
const jwt = require('jsonwebtoken'); // JWT for authentication
const userRoutes = require('./routes/userRoutes'); // User registration and login
const transactionRoutes = require('./routes/transactionRoutes'); // Transaction management

// Initialize dotenv to load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Use dynamic port if provided

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://your-vercel-url.vercel.app", // Replace with your deployed frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Enable credentials if needed (e.g., cookies)
  })
);
app.use(bodyParser.json());

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Database connection error:', err));

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;

// Simple Route to Test JWT
app.post('/api/test-token', (req, res) => {
  const { userId } = req.body;

  // Generate a token
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// Serve static frontend files if needed
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  // Serve the frontend HTML file at the root route
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
