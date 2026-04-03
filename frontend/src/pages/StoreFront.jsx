import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { MapPin, Clock, Star, Phone, Pill, ShoppingCart, MessageSquare, Send } from 'lucide-react';
import './StoreFront.css';
import CartSidebar from '../components/CartSidebar';

export default function StoreFront() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [store, setStore] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const { 
    cartItems, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    cartError, 
    clearCartError 
  } = useContext(CartContext);

  useEffect(() => {
    if (cartError) {
      const timer = setTimeout(() => clearCartError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartError, clearCartError]);

  useEffect(() => {
    fetchStoreData();
    fetchReviews();
  }, [id]);

  const fetchStoreData = async () => {
    try {
      const [storeRes, medRes] = await Promise.all([
        api.get(`/stores/${id}`),
        api.get(`/medicines?storeId=${id}`)
      ]);
      setStore(storeRes.data);
      // Ensure we only show meds for THIS store if backend filtering fails locally
      const medData = medRes.data?.data || medRes.data?.medicines || medRes.data || [];
      const strictMeds = Array.isArray(medData) ? medData.filter(m => (m.storeId?._id || m.storeId) === id) : [];
      setMedicines(strictMeds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/store/${id}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to leave a review');
    
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        type: 'store',
        storeId: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
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

        {cartError && (
          <div className="cart-error-banner" style={{
            background: '#fee2e2', 
            color: '#b91c1c', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
            fontWeight: 500,
            animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
          }}>
            {cartError}
          </div>
        )}

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

      <div className="reviews-section glass-panel">
        <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <MessageSquare size={24} className="text-primary"/> Store Reviews
        </h2>

        {user ? (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div className="rating-input">
              <label>Your Rating:</label>
              <select 
                value={newReview.rating} 
                onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
              >
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <textarea 
              placeholder="Write your experience..." 
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : <><Send size={16}/> Post Review</>}
            </button>
          </form>
        ) : (
          <p className="login-prompt">Please <Link to="/login" className="text-primary">login</Link> to write a review.</p>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="text-muted mt-3">No reviews yet. Be the first to share your feedback!</p>
          ) : (
            reviews.map(rev => (
              <div key={rev._id} className="review-item">
                <div className="review-meta">
                  <span className="review-user">{rev.userId?.name || 'Anonymous User'}</span>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < rev.rating ? "#fbbf24" : "none"} 
                        stroke={i < rev.rating ? "#fbbf24" : "#94a3b8"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{rev.comment}</p>
                <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
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
