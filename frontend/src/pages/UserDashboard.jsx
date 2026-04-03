import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Search, Pill, Stethoscope, MapPin, Activity, LogOut, TrendingUp, MessageCircle } from 'lucide-react';
import './UserDashboard.css';

export default function UserDashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stores, setStores] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [] });
  const headerRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (!loading && user) {
      fetchStats();
      fetchMyReviews();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      const [medRes, docRes, storeRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/doctors'),
        api.get('/stores')
      ]);
      
      const parseMeds = medRes.data.data || medRes.data.medicines || medRes.data || [];
      const parseDocs = docRes.data.data || docRes.data.doctors || docRes.data || [];
      const parseStores = storeRes.data.data || storeRes.data.stores || storeRes.data || [];

      setMedicines(Array.isArray(parseMeds) ? parseMeds : []);
      setDoctors(Array.isArray(parseDocs) ? parseDocs : []);
      setStores(Array.isArray(parseStores) ? parseStores : []);

      // Fetch user reviews (mocked/endpoint if available)
      // Done independently in fetchMyReviews
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const res = await api.get('/reviews/user');
      setReviewsData(res.data || { reviews: [] });
    } catch (err) {
      console.error('Error fetching my reviews:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="loader margin-auto mt-8"></div>;
  if (!user) return null;

  return (
    <div className="user-dash">
      <div className="container">
        {/* Hero Header */}
        <div className="user-dash-header" ref={headerRef}>
          <h1>👋 Welcome, {user.name || 'Patient'}!</h1>
          <p>Your health companion — search medicines, find doctors, and explore stores near you.</p>
          <button 
            onClick={handleLogout} 
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
          >
            <LogOut size={16}/> Logout
          </button>
        </div>

        {/* Stats Row */}
        <div className="user-stats">
          <div className="stat-card">
            <div className="stat-icon blue"><Pill size={24}/></div>
            <div className="stat-info">
              <h3>{medicines.length}</h3>
              <p>Medicines Available</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Stethoscope size={24}/></div>
            <div className="stat-info">
              <h3>{doctors.length}</h3>
              <p>Doctors Listed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><MapPin size={24}/></div>
            <div className="stat-info">
              <h3>{stores.length}</h3>
              <p>Verified Pharmacies</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Activity size={24}/></div>
            <div className="stat-info">
              <h3>{medicines.filter(m => m.quantity > 0).length}</h3>
              <p>In Stock Items</p>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="user-quick-links">
          <Link to="/search?tab=medicines" className="quick-link-card">
            <h3><Search size={20} color="#2563eb"/> Search Medicines</h3>
            <p>Find medicines by name, composition, or availability across all pharmacies in the network.</p>
          </Link>
          <Link to="/search?tab=doctors" className="quick-link-card">
            <h3><Stethoscope size={20} color="#16a34a"/> Find a Doctor</h3>
            <p>Browse verified doctors by specialization, timing, and availability near your area.</p>
          </Link>
          <Link to="/search?tab=stores" className="quick-link-card">
            <h3><MapPin size={20} color="#9333ea"/> Explore Pharmacies</h3>
            <p>Discover pharmacies in your locality with their timings, contact info, and inventory.</p>
          </Link>
          <Link to="/consultation" className="quick-link-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#bbf7d0' }}>
            <h3><MessageCircle size={20} color="#15803d"/> My Consultations</h3>
            <p>Access your securely encrypted active chat sessions with healthcare professionals.</p>
          </Link>
        </div>
        {/* Recent Medicines Section */}
        <div className="user-recent-section">
          <h2><TrendingUp size={20} color="var(--color-primary)"/> Available Medicines</h2>
          {medicines.length === 0 ? (
            <p className="text-muted">No medicines available at the moment.</p>
          ) : (
            <div className="medicine-list">
              {medicines.slice(0, 6).map((med, i) => (
                <div key={med._id || i} className="med-item">
                  <h4>{med.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{med.composition || 'General'}</p>
                  <div className="med-meta">
                    <span className="med-price">₹{med.price}</span>
                    <span className={`badge ${med.quantity > 0 ? 'bg-success' : 'bg-danger'} text-white`}>
                      {med.quantity > 0 ? `${med.quantity} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                  {med.storeId && (
                    <p className="med-store"><MapPin size={12} style={{ display: 'inline' }}/> {typeof med.storeId === 'object' ? med.storeId.name : 'Verified Store'}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Reviews Section */}
        <div className="user-recent-section mt-4">
          <h2><Activity size={20} color="#f59e0b"/> My Recent feedback</h2>
          <div className="glass-panel p-4" style={{ borderRadius: '15px' }}>
            {(!reviewsData.reviews || reviewsData.reviews.length === 0) ? (
              <p className="text-muted">You haven't left any reviews yet. Your recently posted reviews will appear here.</p>
            ) : (
              <div className="user-reviews-list" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {reviewsData.reviews.map(rev => (
                  <div key={rev._id} className="review-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.7)', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                     <div className="flex justify-between items-center mb-2">
                       <strong className="text-sm font-bold text-slate-800">
                         {rev.type === 'doctor' ? `Dr. ${rev.doctorId?.name || 'Unknown'}` : 
                          rev.type === 'store' ? rev.storeId?.name : 
                          rev.medicineId?.name}
                       </strong>
                       <span className="text-amber-500 font-bold text-sm">★ {rev.rating}</span>
                     </div>
                     <p className="text-sm text-slate-600 mb-1">"{rev.comment}"</p>
                     <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
