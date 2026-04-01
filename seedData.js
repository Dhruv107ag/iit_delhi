require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Store = require('./models/Store');
const Doctor = require('./models/Doctor');
const Medicine = require('./models/Medicine');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project2')
  .then(async () => {
    console.log('Connected to Database for Seeding Data');
    
    // Clear existing dummy data if needed (optional)
    await Store.deleteMany({ username: { $regex: '^store' } });
    await Doctor.deleteMany({ name: { $regex: '^Dr.' } });
    await Medicine.deleteMany(); // Clear old medicines

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

    // Seed dummy medicines
    const commonMedicines = [
      { name: 'Paracetamol 500mg', price: 40, quantity: 250, expiry: new Date('2026-12-31'), composition: 'Paracetamol', storeId: store1._id },
      { name: 'Digene Gel', price: 120, quantity: 50, expiry: new Date('2025-08-15'), composition: 'Antacid', storeId: store1._id },
      { name: 'Dolo 650', price: 55, quantity: 300, expiry: new Date('2027-01-20'), composition: 'Paracetamol', storeId: store1._id },
      { name: 'Amoxicillin 250mg', price: 85, quantity: 150, expiry: new Date('2025-11-10'), composition: 'Antibiotic', storeId: store2._id },
      { name: 'Cetirizine 10mg', price: 30, quantity: 500, expiry: new Date('2028-04-05'), composition: 'Antihistamine', storeId: store2._id },
      { name: 'Volini Pain Relief Spray', price: 150, quantity: 20, expiry: new Date('2026-06-30'), composition: 'Diclofenac', storeId: store2._id }
    ];

    await Medicine.create(commonMedicines);
    console.log('Successfully created Medicines!');

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
