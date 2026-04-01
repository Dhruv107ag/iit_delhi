const Doctor = require('../models/Doctor');
const Store = require('../models/Store');

// @desc    Add a new doctor
// @route   POST /api/doctors
// @access  Public
const addDoctor = async (req, res) => {
  try {
    const { name, specialization, experience, description, timing, storeId } = req.body;

    // Validate that storeId exists
    if (!storeId) {
      return res.status(400).json({ message: 'storeId is required' });
    }

    const storeExists = await Store.findById(storeId);
    if (!storeExists) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const newDoctor = new Doctor({
      name,
      specialization,
      experience,
      description,
      timing,
      storeId
      // availability defaults to true in schema
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    res.status(500).json({ message: 'Error adding doctor', error: error.message });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('storeId');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('storeId');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor', error: error.message });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Public
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('storeId');

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Public
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedDoctor = await Doctor.findByIdAndDelete(id);

    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ message: 'Doctor deleted successfully', deletedDoctor });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor
};
