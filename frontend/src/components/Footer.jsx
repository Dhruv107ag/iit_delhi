import { HeartPulse } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <HeartPulse size={28} className="brand-icon" />
            <span className="brand-text">MediConnect</span>
          </div>
          <p className="footer-desc">
            Connecting you to trusted pharmacies, essential medicines, and expert doctors in your area.
          </p>
        </div>
        
        <div className="footer-links">
          <h4>For Patients</h4>
          <a href="#">Search Medicines</a>
          <a href="#">Find Clinics</a>
          <a href="#">Book Doctors</a>
        </div>

        <div className="footer-links">
          <h4>For Pharmacies</h4>
          <a href="#">Partner With Us</a>
          <a href="#">Store Login</a>
          <a href="#">Dashboard Help</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MediConnect Platform. Hackathon Submission.</p>
      </div>
    </footer>
  );
}
