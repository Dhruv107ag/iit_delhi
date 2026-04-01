import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse } from 'lucide-react';
import './AuthForms.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(credentials.username, credentials.password);
    
    if (result.success) {
      if (result.role === 'admin') {
         navigate('/admin');
      } else if (result.role === 'user') {
         navigate('/user-dashboard');
      } else {
         navigate('/dashboard'); // Store owner dashboard
      }
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({...credentials, [e.target.name]: e.target.value});
  };

  return (
    <div className="auth-page section">
      <div className="container auth-container">
        <div className="auth-card glass-panel" style={{ maxWidth: '400px' }}>
          <div className="auth-header text-center">
            <HeartPulse size={40} color="var(--color-primary)" className="margin-auto" />
            <h2>Welcome Back</h2>
            <p>Login to your Mediconnect account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">Username</label>
              <input 
                type="text" 
                name="username"
                className="input-field" 
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                type="password" 
                name="password"
                className="input-field" 
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter password" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary auth-btn mt-3" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : <><ShieldCheck size={18} /> Login to Dashboard</>}
            </button>
          </form>

          <div className="auth-footer text-center mt-3">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
