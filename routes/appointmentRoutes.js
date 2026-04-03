const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getDoctorAppointments, 
  getUserAppointments,
  sendChatMessage
} = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/authMiddleware');

// Logged-in user creates an appointment
router.post('/', requireAuth, createAppointment);

// Logged-in user gets their appointments
router.get('/user', requireAuth, getUserAppointments);

// Doctor or Admin gets appointments for a specific doctor
router.get('/doctor/:doctorId', requireAuth, getDoctorAppointments);

// Chat related route
router.post('/:id/chat', requireAuth, sendChatMessage);

module.exports = router;
