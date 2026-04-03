import { useContext, useState } from 'react';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { X, Bike, Store as StoreIcon, Trash2, Tag, ShoppingBag } from 'lucide-react';
import './CartSidebar.css';

export default function CartSidebar({ isOpen, onClose }) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    deliveryMode, 
    setDeliveryMode,
    couponCode,
    applyCoupon,
    removeCoupon,
    discountPercent,
    clearCart
  } = useContext(CartContext);

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  // Billing Math
  const itemTotal = cartItems.reduce((acc, item) => acc + (item.price * item.cartQty), 0);
  const platformFee = itemTotal > 0 ? 15 : 0;
  
  let deliveryFee = 0;
  if (itemTotal > 0 && deliveryMode === 'rider') {
    deliveryFee = couponCode === 'FREEDEL' ? 0 : 40;
  }
  
  const discountAmount = Math.floor((itemTotal * discountPercent) / 100);
  const grandTotal = itemTotal + platformFee + deliveryFee - discountAmount;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if(res.success) {
      setCouponMsg({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMsg({ type: 'error', text: res.message });
    }
  };

  const handleCheckout = async () => {
    try {
      const itemsToCheckout = cartItems.map(item => ({
        id: item._id,
        quantity: item.cartQty
      }));

      await api.post('/medicines/checkout', { items: itemsToCheckout });
      
      alert(`Order Placed Successfully! 🎉\nAmount to pay: ₹${grandTotal}\nStock updated.`);
      clearCart();
      onClose();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div className="cart-overlay" onClick={onClose}></div>
      
      {/* Sidebar Panel */}
      <aside className="cart-sidebar">
        <header className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={48} opacity={0.5} />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="delivery-tabs">
              <button className={deliveryMode === 'rider' ? 'active' : ''} onClick={() => setDeliveryMode('rider')}>
                <Bike size={18} /> Home Delivery
              </button>
              <button className={deliveryMode === 'takeaway' ? 'active' : ''} onClick={() => setDeliveryMode('takeaway')}>
                <StoreIcon size={18} /> Self Takeaway
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">₹{item.price}</div>
                  </div>
                  <div className="item-qty-actions">
                    <button className="qty-btn" onClick={() => item.cartQty === 1 ? removeFromCart(item._id) : updateQuantity(item._id, -1)}>-</button>
                    <span style={{fontWeight: 600, width: '20px', textAlign: 'center'}}>{item.cartQty}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item._id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-coupon">
              {couponCode ? (
                <div className="active-coupon">
                  <span><Tag size={14}/> <b>{couponCode}</b> Applied!</span>
                  <button className="remove-coupon" onClick={removeCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-group">
                  <input type="text" placeholder="Promo code (e.g. HACK50)" value={couponInput} onChange={e => setCouponInput(e.target.value)} />
                  <button onClick={handleApplyCoupon}>Apply</button>
                </div>
              )}
              {couponMsg.text && !couponCode && <div className={`coupon-message ${couponMsg.type}`}>{couponMsg.text}</div>}
            </div>

            <div className="cart-billing">
               <div className="bill-row"><span>Item Total</span><span>₹{itemTotal}</span></div>
               <div className="bill-row"><span>Platform Fee</span><span>₹{platformFee}</span></div>
               {deliveryMode === 'rider' && (
                 <div className="bill-row">
                   <span>Rider Fee {couponCode === 'FREEDEL' && <span style={{color:'#16a34a', fontSize:'0.75rem'}}>(Waived)</span>}</span>
                   <span style={{ textDecoration: couponCode === 'FREEDEL' ? 'line-through' : 'none' }}>₹40</span>
                 </div>
               )}
               {discountAmount > 0 && <div className="bill-row" style={{color: '#16a34a'}}><span>Item Discount</span><span>-₹{discountAmount}</span></div>}
               
               <div className="bill-row total">
                 <span>To Pay</span>
                 <span>₹{grandTotal}</span>
               </div>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </>
        )}
      </aside>
    </>
  );
}
