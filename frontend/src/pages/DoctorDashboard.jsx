import { useState, useEffect, useContext } from 'react';
import { User, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user && user.role === 'doctor') {
      setDoctor(user);
      fetchAppointments(user.id || user._id);
      setLoading(false);
    } else if (user) {
      setLoading(false); // Not a doctor but authenticated
    }
  }, [user, authLoading, navigate]);


  const fetchAppointments = async (doctorId) => {
    setFetchingAppointments(true);
    try {
       const res = await api.get(`/appointments/doctor/${doctorId}`);
       setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
       console.error('Error fetching appointments:', err);
    } finally {
       setFetchingAppointments(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newAvailability = !doctor.availability;
      // In a real app, update the backend here
      setDoctor({ ...doctor, availability: newAvailability });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-state">Loading Portal...</div>;
  if (!doctor) return <div className="error-state">Access Denied</div>;

  return (
    <div className="doctor-dashboard section fade-in">
      <div className="container">
        <header className="dashboard-header glass-panel">
          <div className="doctor-info">
            <div className="avatar-placeholder">
              <User size={40} />
            </div>
            <div>
              <h1>Welcome, {doctor.name}</h1>
              <p className="specialization">{doctor.specialization || 'Medical Specialist'}</p>
            </div>
          </div>
          <div className="status-toggle">
            <span className={`status-badge ${doctor.availability ? 'available' : 'unavailable'}`}>
              {doctor.availability ? 'Online' : 'Offline'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={toggleAvailability}>
              {doctor.availability ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="stats-card glass-panel">
            <h3>Overview</h3>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">12</span>
                <span className="stat-label">Patients Today</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">4.9</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>

          <div className="consultations-list glass-panel">
            <div className="list-header">
              <h3>Upcoming Consultations</h3>
              <Clock size={20} />
            </div>
            <div className="list-items">
              {fetchingAppointments ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}><div className="loader"></div></div>
              ) : appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>No upcoming consultations.</div>
              ) : (
                appointments.map((app, i) => (
                  <div key={app._id || i} className="cons-item">
                    <div className="cons-info">
                      <div className="flex justify-between items-start">
                        <span className="patient-name font-bold text-slate-800">{app.userId?.name || 'Patient'}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {new Date(app.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="cons-meta block mt-1 text-xs text-slate-500">
                        <Clock size={12} className="inline mr-1 opacity-60"/> 
                        {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {app.reason || 'Consultation'}
                      </span>
                      {app.lastMessage && (
                        <div className="mt-2 p-2 bg-slate-50 rounded border-l-2 border-green-500 text-xs text-slate-600 italic">
                          "{app.lastMessage}"
                        </div>
                      )}
                    </div>
                    <div className="cons-actions mt-3">
                      <Link to={`/consultation?appointmentId=${app._id}`} className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2">
                        <MessageSquare size={14}/> Open WhatsApp Chat
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="doctor-details glass-panel">
            <h3>Profile Details</h3>
            <div className="details-grid">
              <div className="detail-field">
                <label>Experience</label>
                <p>{doctor.experience || 'Not specified'}</p>
              </div>
              <div className="detail-field">
                <label>Timing</label>
                <p>{doctor.timing || '09:00 AM - 05:00 PM'}</p>
              </div>
              <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                <label>Bio</label>
                <p>{doctor.description || 'Experienced medical professional dedicated to patient care.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
