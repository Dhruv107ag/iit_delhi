import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Menu, Search, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar glass-panel">
      <div className="container nav-content">
        <Link to="/" className="nav-brand">
          <HeartPulse size={32} strokeWidth={2.5} className="brand-icon" />
          <span className="brand-text">MediConnect</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/search?tab=medicines" className="nav-link">
            <Search size={18} />
            Find Medicine
          </Link>
          <Link to="/search?tab=stores" className="nav-link">Pharmacies</Link>
          <Link to="/search?tab=doctors" className="nav-link">Doctors</Link>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link 
                to={user.role === 'admin' ? '/admin' : user.role === 'store_owner' ? '/store-dashboard' : '/user-dashboard'} 
                className="btn btn-outline"
              >
                Dashboard
              </Link>
              <button className="btn btn-outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut size={16}/> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline">Login</Link>
          )}
          <button className="mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

