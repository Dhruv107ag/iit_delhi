const bcrypt = require('bcryptjs');
const Store = require('../models/Store');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// @desc    Register a new store or user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, address, phone, openingTime, closingTime, username, password, role } = req.body;
    
    // Check if username exists in any collection
    const existingStore = await Store.findOne({ username });
    const existingAdmin = await Admin.findOne({ username });
    const existingUser = await User.findOne({ username });
    const existingDoctor = await Doctor.findOne({ username });

    if (existingStore || existingAdmin || existingUser || existingDoctor) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === 'user') {
      const newUser = new User({
        name,
        username,
        password: hashedPassword,
        role: 'user'
      });
      await newUser.save();
      return res.status(201).json({ message: 'User registered successfully' });
    } else if (role === 'doctor') {
      const newDoctor = new Doctor({
        name,
        username,
        password: hashedPassword,
        role: 'doctor'
      });
      await newDoctor.save();
      return res.status(201).json({ message: 'Doctor registered successfully' });
    } else {
      // Default to store registration
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
      return res.status(201).json({ message: 'Store registered successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error registering', error: error.message });
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
      user = await User.findOne({ username });
    }

    if (!user) {
      user = await Doctor.findOne({ username });
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
      role: user.role,
      name: user.name || user.username
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
