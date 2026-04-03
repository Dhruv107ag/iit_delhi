require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/Doctor');
const Store = require('./models/Store');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to Database for Doctor Seeding');
    
    // Find a store to attach the doctor to
    const store = await Store.findOne();
    if (!store) {
      console.error('No stores found. Please seed stores first.');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('doctor123', salt);

    // Create a doctor with auth fields
    const newDoctor = await Doctor.create({
      name: 'Dr. Ramesh Kumar',
      username: 'dr_ramesh',
      password: hashedPassword,
      specialization: 'General Physician',
      experience: '12 Years',
      description: 'Senior medical expert specializing in internal medicine.',
      timing: '10:00 AM - 04:00 PM',
      availability: true,
      role: 'doctor',
      storeId: store._id
    });

    console.log('------------------------------');
    console.log('Doctor Login Credentials:');
    console.log(`Username: dr_ramesh`);
    console.log(`Password: doctor123`);
    console.log('------------------------------');

    process.exit();
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
