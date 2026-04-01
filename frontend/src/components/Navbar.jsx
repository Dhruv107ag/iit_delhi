import { Link } from 'react-router-dom';
import { HeartPulse, Menu, UserCircle, Search } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar glass-panel">
      <div className="container nav-content">
        <Link to="/" className="nav-brand">
          <HeartPulse size={32} strokeWidth={2.5} className="brand-icon" />
          <span className="brand-text">MediConnect</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/search" className="nav-link">
            <Search size={18} />
            Find Medicine
          </Link>
          <Link to="/stores" className="nav-link">Pharmacies</Link>
          <Link to="/doctors" className="nav-link">Doctors</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-outline">Store Login</Link>
          <button className="mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
