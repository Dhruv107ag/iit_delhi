const bcrypt = require('bcryptjs');
const Store = require('../models/Store');
const Admin = require('../models/Admin');

// @desc    Register a new store
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, address, phone, openingTime, closingTime, username, password } = req.body;
    
    // Check if store with username already exists
    const existingStore = await Store.findOne({ username });
    if (existingStore) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if Admin exists with same username (optional but good practice)
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStore = new Store({
      name,
      address,
      phone,
      openingTime,
      closingTime,
      username,
      password: hashedPassword,
      role: 'store_owner'
    });

    await newStore.save();
    res.status(201).json({ message: 'Store registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering store', error: error.message });
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await Admin.findOne({ username });
    
    if (!user) {
      user = await Store.findOne({ username });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.user = {
      id: user._id,
      role: user.role
    };

    res.status(200).json({ message: 'Login successful', role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// @desc    Logout
// @route   GET /api/auth/logout
// @access  Private
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err.message });
    }
    res.clearCookie('connect.sid'); // connect.sid is the default name
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.status(200).json({ user: req.session.user });
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
