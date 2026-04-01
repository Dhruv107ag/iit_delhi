import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, Pill, MapPin, Stethoscope, Star, LogOut, Trash2, Users } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalStores: 0, totalMedicines: 0, totalDoctors: 0, totalReviews: 0 });
  const [stores, setStores] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('stores');

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
      setStats({
        totalStores: s.length,
        totalMedicines: m.length,
        totalDoctors: d.length,
        totalReviews: 0
      });
    } catch (err) {
      console.error('Admin fetch error:', err);
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
        </div>

        {/* Content */}
        {activeTab === 'stores' && (
          <div className="admin-section">
            <h2><MapPin size={18} color="var(--color-primary)"/> Registered Pharmacies</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Address</th><th>Phone</th><th>Timings</th><th>Username</th></tr></thead>
                <tbody>
                  {stores.map((s, i) => (
                    <tr key={s._id || i}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.address}</td>
                      <td>{s.phone}</td>
                      <td>{s.openingTime} - {s.closingTime}</td>
                      <td><code>{s.username}</code></td>
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

      </div>
    </div>
  );
}
