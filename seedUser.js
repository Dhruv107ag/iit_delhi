require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to Database for User Seeding');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('user123', salt);

    // Create a patient user
    const newUser = await User.create({
      name: 'Dhruv Sharma',
      username: 'dhruv_user',
      password: hashedPassword,
      phone: '9999888877',
      role: 'user'
    });

    console.log('------------------------------');
    console.log('Patient Login Credentials:');
    console.log(`Username: dhruv_user`);
    console.log(`Password: user123`);
    console.log('------------------------------');

    process.exit();
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
