const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Logged-in user)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, reason } = req.body;
    
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const newAppointment = new Appointment({
      userId: req.session.user.id,
      doctorId,
      appointmentDate: appointmentDate || new Date(),
      reason: reason || 'General Consultation'
    });

    const savedAppointment = await newAppointment.save();
    console.log('[Appointment Created] ID:', savedAppointment._id, 'for Doctor:', doctorId);
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('[Appointment Error] Details:', error.message);
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
};

// @desc    Get all appointments for a doctor
// @route   GET /api/appointments/doctor/:doctorId
// @access  Private (Doctor or Admin)
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Security check: Only the doctor themselves or an admin can view these appointments
    if (req.session.user.role === 'doctor' && req.session.user.id !== doctorId) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own appointments' });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('[Doctor Appointments Error] Details:', error.message);
    res.status(500).json({ message: 'Error fetching doctor appointments', error: error.message });
  }
};

// @desc    Get all appointments for a user
// @route   GET /api/appointments/user
// @access  Private
const getUserAppointments = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: 'Not authenticated' });
    
    const appointments = await Appointment.find({ userId: req.session.user.id })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user appointments', error: error.message });
  }
};

// @desc    SendMessage in chat
// @route   POST /api/appointments/:id/chat
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body; // sender should be 'user' or 'doctor'

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Consultation session not found' });

    appointment.chatHistory.push({ message, sender });
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getDoctorAppointments,
  getUserAppointments,
  sendChatMessage
};
