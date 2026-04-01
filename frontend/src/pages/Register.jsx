import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, UserPlus, Store as StoreIcon, User as UserIcon } from 'lucide-react';
import './AuthForms.css';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [roleType, setRoleType] = useState('user'); // 'user' or 'store'
  
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

    const payload = roleType === 'user' 
      ? { name: formData.name, username: formData.username, password: formData.password, role: 'user' }
      : { ...formData, role: 'store_owner' };

    const result = await register(payload);
    
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
        <div className="auth-card glass-panel" style={{ maxWidth: roleType === 'store' ? '600px' : '400px' }}>
          <div className="auth-header text-center">
            <HeartPulse size={40} color="var(--color-primary)" className="margin-auto" />
            <h2>{roleType === 'store' ? 'Register Pharmacy' : 'Patient Registration'}</h2>
            <p>{roleType === 'store' ? 'Join the Mediconnect network as a verified store.' : 'Create an account to track and search medicines.'}</p>
          </div>

          <div className="role-toggle text-center mb-4" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              type="button"
              className={`btn ${roleType === 'user' ? 'btn-primary' : 'btn-outline-primary'}`} 
              onClick={() => { setRoleType('user'); setError(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <UserIcon size={16}/> Patient
            </button>
            <button 
              type="button"
              className={`btn ${roleType === 'store' ? 'btn-primary' : 'btn-outline-primary'}`} 
              onClick={() => { setRoleType('store'); setError(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <StoreIcon size={16}/> Pharmacy
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" style={roleType === 'store' ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' } : {}}>
            
            <div className="input-group" style={roleType === 'store' ? { gridColumn: '1 / -1' } : {}}>
              <label className="input-label">Full Name</label>
              <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder={roleType === 'store' ? "e.g. Apollo Pharmacy" : "e.g. Rahul Sharma"} required />
            </div>

            <div className="input-group" style={roleType === 'store' ? {} : {}}>
              <label className="input-label">Username</label>
              <input type="text" name="username" className="input-field" value={formData.username} onChange={handleChange} placeholder="Unique username" required />
            </div>

            <div className="input-group" style={roleType === 'store' ? {} : {}}>
              <label className="input-label">Password</label>
              <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} placeholder="Secure password" required />
            </div>

            {roleType === 'store' && (
              <>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Full Address</label>
                  <input type="text" name="address" className="input-field" value={formData.address} onChange={handleChange} placeholder="Store location" required={roleType === 'store'} />
                </div>

                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Contact Phone</label>
                  <input type="text" name="phone" className="input-field" value={formData.phone} onChange={handleChange} placeholder="Phone number" required={roleType === 'store'} />
                </div>

                <div className="input-group">
                  <label className="input-label">Opening Time</label>
                  <input type="time" name="openingTime" className="input-field" value={formData.openingTime} onChange={handleChange} required={roleType === 'store'} />
                </div>

                <div className="input-group">
                  <label className="input-label">Closing Time</label>
                  <input type="time" name="closingTime" className="input-field" value={formData.closingTime} onChange={handleChange} required={roleType === 'store'} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary auth-btn" style={roleType === 'store' ? { gridColumn: '1 / -1' } : { marginTop: '1rem' }} disabled={isLoading}>
              {isLoading ? 'Registering...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="auth-footer text-center mt-3">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
