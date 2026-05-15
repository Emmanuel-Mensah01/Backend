const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register-pastor  (one-time setup)
const registerPastor = async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  if (secretKey !== process.env.PASTOR_SECRET_KEY) {
    return res.status(403).json({ success: false, message: 'Invalid secret key.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }

  const pastor = await User.create({ name, email, password, role: 'pastor' });
  const token = generateToken(pastor);

  res.status(201).json({ success: true, token, user: { id: pastor._id, name: pastor.name, role: pastor.role } });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, role: user.role },
  });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, user: { id: user._id, name: user.name, role: user.role } });
};

module.exports = { registerPastor, login, getMe };