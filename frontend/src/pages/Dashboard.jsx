import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LayoutDashboard, Pill, UserPlus, LogOut, Loader, PlusCircle } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('medicines');
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [newItem, setNewItem] = useState({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user && user.role === 'store_owner') {
      if (activeTab === 'medicines') fetchMedicines();
      if (activeTab === 'doctors') fetchDoctors();
    }
  }, [user, loading, navigate, activeTab]);

  const fetchMedicines = async () => {
    if (!user?.id) return;
    setFetching(true);
    try {
      const { data } = await api.get('/medicines');
      let list = data.data || data.medicines || data || [];
      list = list.filter(m => !m.storeId || m.storeId._id === user.id || m.storeId === user.id); 
      setMedicines(list);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const fetchDoctors = async () => {
    if (!user?.id) return;
    setFetching(true);
    try {
      const { data } = await api.get('/doctors');
      let list = data.data || data.doctors || data || [];
      list = list.filter(d => (d.storeId && (d.storeId._id === user.id || d.storeId === user.id)));
      setDoctors(list);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if(activeTab === 'medicines') {
         await api.post('/medicines', { ...newItem, storeId: user.id });
         setNewItem({});
         fetchMedicines();
      } else if (activeTab === 'doctors') {
         await api.post('/doctors', { ...newItem, storeId: user.id });
         setNewItem({});
         fetchDoctors();
      }
    } catch(err) {
      console.error(err);
      alert('Failed to create. Check if username is already taken or fields are missing.');
    }
  };

  if (loading) return <div className="loader margin-auto mt-8"></div>;
  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <LayoutDashboard size={24} className="text-primary" />
          <h2>Store Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
             className={`nav-item ${activeTab === 'medicines' ? 'active' : ''}`}
             onClick={() => setActiveTab('medicines')}
          >
            <Pill size={18} /> Manage Inventory
          </button>
          <button 
             className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
             onClick={() => setActiveTab('doctors')}
          >
            <UserPlus size={18} /> Manage Doctors
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item text-error" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <h1 className="capitalize">Welcome back</h1>
            <p className="text-muted text-sm">Manage your pharmacy operations efficiently.</p>
          </div>
        </header>

        <section className="dashboard-body">
          <div className="dashboard-card glass-panel shadow-md">
            <h3 className="card-title flex align-center gap-2 mb-4">
              <PlusCircle size={20} className="text-primary"/> 
              Add New {activeTab === 'medicines' ? 'Medicine' : 'Doctor'}
            </h3>
            
            <form onSubmit={handleCreate} className="quick-add-form">
              {activeTab === 'medicines' ? (
                <>
                  <input type="text" placeholder="Medicine Name" className="input-field" required value={newItem.name || ''} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
                  <input type="number" placeholder="Price (₹)" className="input-field" required value={newItem.price || ''} onChange={(e) => setNewItem({...newItem, price: e.target.value})} />
                  <input type="number" placeholder="Quantity" className="input-field" required value={newItem.quantity || ''} onChange={(e) => setNewItem({...newItem, quantity: e.target.value})} />
                </>
              ) : (
                <>
                  <input type="text" placeholder="Dr. Full Name" className="input-field" required value={newItem.name || ''} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
                  <input type="text" placeholder="Specialization" className="input-field" required value={newItem.specialization || ''} onChange={(e) => setNewItem({...newItem, specialization: e.target.value})} />
                  <input type="text" placeholder="Timing (e.g. 10 AM - 4 PM)" className="input-field" required value={newItem.timing || ''} onChange={(e) => setNewItem({...newItem, timing: e.target.value})} />
                  <div className="flex gap-2 w-full">
                    <input type="text" placeholder="Choose Username" className="input-field" required value={newItem.username || ''} onChange={(e) => setNewItem({...newItem, username: e.target.value})} />
                    <input type="password" placeholder="Set Password" className="input-field" required value={newItem.password || ''} onChange={(e) => setNewItem({...newItem, password: e.target.value})} />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary" style={{ height: '100%', borderRadius: 'var(--radius-md)' }}>Save</button>
            </form>
          </div>

          <div className="dashboard-card glass-panel shadow-md mt-6">
             <h3 className="card-title mb-4">Current {activeTab === 'medicines' ? 'Inventory' : 'Doctors'}</h3>
             
             {fetching ? ( <Loader size={24} className="spin text-primary margin-auto" /> ) : (
               <div className="data-table-wrapper">
                 <table className="data-table">
                   <thead>
                     <tr>
                       <th>Name</th>
                       <th>{activeTab === 'medicines' ? 'Quantity' : 'Specialization'}</th>
                       <th>{activeTab === 'medicines' ? 'Price' : 'Timing'}</th>
                       <th>Status</th>
                     </tr>
                   </thead>
                   <tbody>
                      {activeTab === 'medicines' ? medicines.map((m, i) => (
                        <tr key={i}>
                          <td className="font-medium">{m.name}</td>
                          <td>{m.quantity}</td>
                          <td>₹{m.price}</td>
                          <td><span className={`badge ${m.quantity > 0 ? 'bg-success' : 'bg-danger'} text-white`}>{m.quantity > 0 ? 'In Stock' : 'Empty'}</span></td>
                        </tr>
                      )) : doctors.length > 0 ? doctors.map((d, i) => (
                        <tr key={i}>
                          <td className="font-medium">{d.name}</td>
                          <td>{d.specialization}</td>
                          <td>{d.timing}</td>
                          <td><span className={`badge bg-primary text-white`}>{d.availability ? 'Available' : 'Busy'}</span></td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="text-center text-muted">No {activeTab} found for your pharmacy.</td></tr>
                      )}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </section>
      </main>
    </div>
  );
}
