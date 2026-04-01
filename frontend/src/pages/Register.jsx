import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, UserPlus } from 'lucide-react';
import './AuthForms.css';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    address: '',
    phone: '',
    openingTime: '',
    closingTime: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Quick validation
    if(formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="auth-page section">
      <div className="container auth-container">
        <div className="auth-card glass-panel" style={{ maxWidth: '600px' }}>
          <div className="auth-header text-center">
            <HeartPulse size={40} color="var(--color-primary)" className="margin-auto" />
            <h2>Register Pharmacy</h2>
            <p>Join the Mediconnect network as a verified store.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Store Name</label>
              <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="e.g. Apollo Pharmacy" required />
            </div>

            <div className="input-group">
              <label className="input-label">Username</label>
              <input type="text" name="username" className="input-field" value={formData.username} onChange={handleChange} placeholder="Unique username" required />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} placeholder="Secure password" required />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Full Address</label>
              <input type="text" name="address" className="input-field" value={formData.address} onChange={handleChange} placeholder="Store location" required />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Contact Phone</label>
              <input type="text" name="phone" className="input-field" value={formData.phone} onChange={handleChange} placeholder="Phone number" required />
            </div>

            <div className="input-group">
              <label className="input-label">Opening Time</label>
              <input type="time" name="openingTime" className="input-field" value={formData.openingTime} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label className="input-label">Closing Time</label>
              <input type="time" name="closingTime" className="input-field" value={formData.closingTime} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary auth-btn" style={{ gridColumn: '1 / -1' }} disabled={isLoading}>
              {isLoading ? 'Registering...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="auth-footer text-center">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
