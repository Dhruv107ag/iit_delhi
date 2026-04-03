import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, Pill, MapPin, Stethoscope, Star, LogOut, Trash2, Users, Plus } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalStores: 0, totalMedicines: 0, totalDoctors: 0, totalReviews: 0 });
  const [stores, setStores] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('stores');
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', address: '', phone: '', username: '', password: '' });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
    if (!loading && user && user.role === 'admin') {
      fetchAll();
    }
  }, [user, loading]);

  const fetchAll = async () => {
    try {
      const [storeRes, medRes, docRes] = await Promise.all([
        api.get('/stores'),
        api.get('/medicines'),
        api.get('/doctors')
      ]);

      const s = Array.isArray(storeRes.data) ? storeRes.data : storeRes.data.data || [];
      const m = Array.isArray(medRes.data) ? medRes.data : medRes.data.data || [];
      const d = Array.isArray(docRes.data) ? docRes.data : docRes.data.data || [];

      setStores(s);
      setMedicines(m);
      setDoctors(d);
      
      try {
        const revRes = await api.get('/reviews');
        const r = Array.isArray(revRes.data) ? revRes.data : [];
        setReviews(r);
        setStats({
          totalStores: s.length,
          totalMedicines: m.length,
          totalDoctors: d.length,
          totalReviews: r.length
        });
      } catch (err) {
        setStats({
          totalStores: s.length,
          totalMedicines: m.length,
          totalDoctors: d.length,
          totalReviews: 0
        });
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores');
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      // Note: Defaulting times for admin-created stores
      await api.post('/auth/register', {
        ...newStore,
        role: 'store_owner',
        openingTime: '09:00 AM',
        closingTime: '10:00 PM'
      });
      setNewStore({ name: '', address: '', phone: '', username: '', password: '' });
      setShowAddStore(false);
      fetchStores();
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding store');
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm('Are you sure you want to remove this store?')) return;
    try {
      // In this setup, we use the store routes which should be updated to allow admin
      await api.delete(`/stores/${id}`);
      fetchStores();
      fetchAll();
    } catch (err) {
      alert('Error deleting store');
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      fetchAll();
    } catch (err) { alert('Delete failed'); }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchAll();
    } catch (err) { alert('Delete failed'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loader margin-auto mt-8"></div>;
  if (!user) return null;

  return (
    <div className="admin-dash">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <h1><ShieldCheck size={24} style={{ display: 'inline', verticalAlign: 'middle' }}/> Admin Control Panel</h1>
          <p>Manage all stores, medicines, and doctors across MediConnect.</p>
          <button onClick={handleLogout} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <LogOut size={16}/> Logout
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat">
            <div className="admin-stat-icon i1"><MapPin size={24}/></div>
            <div className="admin-stat-info"><h3>{stats.totalStores}</h3><p>Total Stores</p></div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-icon i2"><Pill size={24}/></div>
            <div className="admin-stat-info"><h3>{stats.totalMedicines}</h3><p>Total Medicines</p></div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-icon i3"><Stethoscope size={24}/></div>
            <div className="admin-stat-info"><h3>{stats.totalDoctors}</h3><p>Total Doctors</p></div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-icon i4"><Star size={24}/></div>
            <div className="admin-stat-info"><h3>{stats.totalReviews}</h3><p>Total Reviews</p></div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="admin-actions-row">
          <button className={`admin-action-btn ${activeTab === 'stores' ? 'primary' : ''}`} onClick={() => setActiveTab('stores')}>
            <MapPin size={16}/> Stores
          </button>
          <button className={`admin-action-btn ${activeTab === 'medicines' ? 'primary' : ''}`} onClick={() => setActiveTab('medicines')}>
            <Pill size={16}/> Medicines
          </button>
          <button className={`admin-action-btn ${activeTab === 'doctors' ? 'primary' : ''}`} onClick={() => setActiveTab('doctors')}>
            <Stethoscope size={16}/> Doctors
          </button>
          <button className={`admin-action-btn ${activeTab === 'reviews' ? 'primary' : ''}`} onClick={() => setActiveTab('reviews')}>
            <Star size={16}/> Reviews
          </button>
          <button className="admin-action-btn success" style={{ marginLeft: 'auto' }} onClick={() => setShowAddStore(true)}>
            <Plus size={16}/> Add Store
          </button>
        </div>

        {/* Add Store Modal */}
        {showAddStore && (
          <div className="admin-modal-overlay">
            <div className="admin-modal glass-panel">
              <h2>Register New Pharmacy</h2>
              <form onSubmit={handleAddStore}>
                <div className="input-group">
                  <label>Store Name</label>
                  <input type="text" required value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Address</label>
                  <input type="text" required value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input type="text" required value={newStore.phone} onChange={e => setNewStore({...newStore, phone: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" required value={newStore.username} onChange={e => setNewStore({...newStore, username: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" required value={newStore.password} onChange={e => setNewStore({...newStore, password: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="admin-action-btn" onClick={() => setShowAddStore(false)}>Cancel</button>
                  <button type="submit" className="admin-action-btn primary">Create Store</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'stores' && (
          <div className="admin-section">
            <h2><MapPin size={18} color="var(--color-primary)"/> Registered Pharmacies</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Address</th><th>Phone</th><th>Timings</th><th>Username</th><th>Action</th></tr></thead>
                <tbody>
                  {stores.map((s, i) => (
                    <tr key={s._id || i}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.address}</td>
                      <td>{s.phone}</td>
                      <td>{s.openingTime} - {s.closingTime}</td>
                      <td><code>{s.username}</code></td>
                      <td>
                        <button className="admin-action-btn danger" onClick={() => handleDeleteStore(s._id)}>
                          <Trash2 size={14}/> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {stores.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No stores found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'medicines' && (
          <div className="admin-section">
            <h2><Pill size={18} color="#16a34a"/> All Medicines</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Composition</th><th>Price</th><th>Qty</th><th>Store</th><th>Action</th></tr></thead>
                <tbody>
                  {medicines.map((m, i) => (
                    <tr key={m._id || i}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.composition || '-'}</td>
                      <td>₹{m.price}</td>
                      <td><span style={{ color: m.quantity > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{m.quantity}</span></td>
                      <td>{typeof m.storeId === 'object' ? m.storeId?.name : '—'}</td>
                      <td><button className="admin-action-btn danger" onClick={() => handleDeleteMedicine(m._id)}><Trash2 size={14}/> Delete</button></td>
                    </tr>
                  ))}
                  {medicines.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No medicines found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="admin-section">
            <h2><Stethoscope size={18} color="#9333ea"/> All Doctors</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Timing</th><th>Store</th><th>Action</th></tr></thead>
                <tbody>
                  {doctors.map((d, i) => (
                    <tr key={d._id || i}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.specialization}</td>
                      <td>{d.experience}</td>
                      <td>{d.timing}</td>
                      <td>{typeof d.storeId === 'object' ? d.storeId?.name : '—'}</td>
                      <td><button className="admin-action-btn danger" onClick={() => handleDeleteDoctor(d._id)}><Trash2 size={14}/> Delete</button></td>
                    </tr>
                  ))}
                  {doctors.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No doctors found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="admin-section">
            <h2><Star size={18} color="#fbbf24"/> All User Feedback</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Type</th><th>Target</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
                <tbody>
                  {reviews.map((r, i) => (
                    <tr key={r._id || i}>
                      <td><span className={`badge ${r.type === 'store' ? 'bg-primary' : 'bg-info'} text-white`}>{r.type}</span></td>
                      <td style={{ fontWeight: 600 }}>{r.storeId?.name || r.doctorId?.name || r.medicineId?.name || 'Unknown'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < r.rating ? "#fbbf24" : "none"} stroke={i < r.rating ? "#fbbf24" : "#94a3b8"} />
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{r.comment}</td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {reviews.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No feedback found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
