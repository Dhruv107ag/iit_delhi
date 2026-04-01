require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project2')
  .then(async () => {
    console.log('Connected to Database');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists (Username: admin)');
      process.exit();
    }
    
    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await Admin.create({ 
      username: 'admin', 
      password: hashedPassword 
    });
    
    console.log('Successfully created new Admin!');
    console.log('------------------------------');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('------------------------------');
    
    process.exit();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
