require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Store = require('./models/Store');
const Doctor = require('./models/Doctor');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project2')
  .then(async () => {
    console.log('Connected to Database for Seeding Data');
    
    // Clear existing dummy data if needed (optional)
    await Store.deleteMany({ username: { $regex: '^store' } });
    await Doctor.deleteMany({ name: { $regex: '^Dr.' } });

    // Seed dummy store owners
    const salt = await bcrypt.genSalt(10);
    const storePassword = await bcrypt.hash('store123', salt);

    const store1 = await Store.create({
      name: 'City Pharmacy & Clinic',
      address: '123 Health Ave, New Delhi',
      phone: '9876543210',
      openingTime: '09:00 AM',
      closingTime: '10:00 PM',
      username: 'store_city',
      password: storePassword
    });

    const store2 = await Store.create({
      name: 'Aarogya Medicos',
      address: '45 Wellness Blvd, Hauz Khas, Delhi',
      phone: '9123456780',
      openingTime: '08:00 AM',
      closingTime: '11:00 PM',
      username: 'store_aarogya',
      password: storePassword
    });

    console.log('Successfully created Stores!');

    // Seed dummy doctors
    await Doctor.create([
      {
        name: 'Dr. Ramesh Kumar',
        specialization: 'General Physician',
        experience: '10 Years',
        description: 'Expert in general medicine and family health.',
        timing: '10:00 AM - 02:00 PM',
        availability: true,
        storeId: store1._id
      },
      {
        name: 'Dr. Sunita Sharma',
        specialization: 'Pediatrician',
        experience: '8 Years',
        description: 'Specialist in child healthcare and vaccination.',
        timing: '04:00 PM - 08:00 PM',
        availability: true,
        storeId: store1._id
      },
      {
        name: 'Dr. Amit Singh',
        specialization: 'Dermatologist',
        experience: '5 Years',
        description: 'Skin care specialist.',
        timing: '11:00 AM - 03:00 PM',
        availability: true,
        storeId: store2._id
      }
    ]);

    console.log('Successfully created Doctors!');
    console.log('------------------------------');
    console.log('Sample Store Logins:');
    console.log('Store 1 -> Username: store_city, Password: store123');
    console.log('Store 2 -> Username: store_aarogya, Password: store123');
    console.log('------------------------------');

    process.exit();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
