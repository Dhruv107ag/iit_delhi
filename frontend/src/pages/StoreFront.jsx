import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { MapPin, Clock, Star, Phone, Pill, ShoppingCart } from 'lucide-react';
import './StoreFront.css';
import CartSidebar from '../components/CartSidebar';

export default function StoreFront() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useContext(CartContext);

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const fetchStoreData = async () => {
    try {
      const [storeRes, medRes] = await Promise.all([
        api.get(`/stores/${id}`),
        api.get(`/medicines?storeId=${id}`)
      ]);
      setStore(storeRes.data);
      // Ensure we only show meds for THIS store if backend filtering fails locally
      const strictMeds = medRes.data.filter(m => (m.storeId?._id || m.storeId) === id);
      setMedicines(strictMeds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getItemCartQty = (medId) => {
    const item = cartItems.find(i => i._id === medId);
    return item ? item.cartQty : 0;
  };

  if (loading) return <div className="loading-state">Loading Store...</div>;
  if (!store) return <div className="error-state">Store not found</div>;

  const totalItems = cartItems.reduce((acc, item) => acc + item.cartQty, 0);

  return (
    <div className="storefront-page fade-in">
      <div className="store-header-banner">
        <div className="store-header-content">
          <h1 className="store-title">{store.name}</h1>
          <div className="store-subtitle">
            <span><MapPin size={18}/> {store.address}</span>
            <span><Clock size={18}/> 09:00 AM - 10:00 PM</span>
            <span><Star size={18} fill="#fbbf24" stroke="#fbbf24"/> 4.8</span>
          </div>
          <p style={{color: '#94a3b8'}}><Phone size={14} style={{display:'inline', marginBottom:'-2px'}}/> {store.contactPhone || "+91 9999999999"}</p>
        </div>
      </div>

      <div className="inventory-section">
        <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b'}}>
          <Pill size={24} className="text-primary"/> Available Medicines
        </h2>

        {medicines.length === 0 ? (
          <div className="empty-state bg-white p-8 rounded-lg shadow-sm">No inventory visible for this pharmacy.</div>
        ) : (
          <div className="inventory-grid">
            {medicines.map(med => {
              const qty = getItemCartQty(med._id);
              const outOfStock = med.quantity <= 0;
              
              return (
                <div key={med._id} className={`med-card ${outOfStock ? 'opacity-50' : ''}`}>
                  <div className="med-price"><span className="text-sm font-normal text-muted">₹</span>{med.price}</div>
                  <h3 className="med-name">{med.name}</h3>
                  <p className="med-composition">{med.composition || 'Standard formula'}</p>
                  
                  <div className="med-footer">
                    <span className={`text-sm font-medium ${outOfStock ? 'text-danger' : 'text-success'}`}>
                      {outOfStock ? 'Out of Stock' : `${med.quantity} available`}
                    </span>
                    
                    {qty > 0 ? (
                      <div className="qty-control">
                        <button onClick={() => qty === 1 ? removeFromCart(med._id) : updateQuantity(med._id, -1)}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => updateQuantity(med._id, 1)} disabled={qty >= med.quantity}>+</button>
                      </div>
                    ) : (
                      <button 
                        className="add-btn" 
                        onClick={() => addToCart(med, store)}
                        disabled={outOfStock}
                      >
                        + ADD
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <button className="view-cart-fab" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={22} />
          {totalItems} items in Cart
        </button>
      )}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
