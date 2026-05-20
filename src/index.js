require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes            = require('./routes/authRoutes');
const submissionRoutes      = require('./routes/submissionRoutes');
const interpretationRoutes  = require('./routes/interpretationRoutes');
const paymentRoutes         = require('./routes/paymentRoutes');
const contentRoutes         = require('./routes/contentRoutes');
const podcastLinkRoutes     = require('./routes/podcastLinkRoutes');
const prayerRequestRoutes   = require('./routes/prayerRequestRoutes'); // ← once only

const app = express();

connectDB();

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setTimeout(120000);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',            authRoutes);
app.use('/api/submissions',     submissionRoutes);
app.use('/api/interpretations', interpretationRoutes);
app.use('/api/payments',        paymentRoutes);
app.use('/api/content',         contentRoutes);
app.use('/api/podcast-links',   podcastLinkRoutes);
app.use('/api/prayer-requests', prayerRequestRoutes); // ← once only

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dream App API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});