import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('mc_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [deliveryMode, setDeliveryMode] = useState('rider'); // 'rider' or 'takeaway'
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem('mc_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (medicine, store) => {
    setCartItems(prev => {
      // Prevent adding items from different stores
      if (prev.length > 0) {
         // Because storeId could be an object if populated, let's extract string id safely
         const currentStoreId = typeof prev[0].storeId === 'object' ? prev[0].storeId._id : prev[0].storeId;
         const newStoreId = typeof store._id === 'object' ? store._id : store._id;
         
         if (currentStoreId !== newStoreId) {
           alert("You can only order from one pharmacy at a time. Clear cart to switch stores.");
           return prev; // Cancel addition
         }
      }

      const existingItem = prev.find(item => item._id === medicine._id);
      if (existingItem) {
        if (existingItem.cartQty >= medicine.quantity) {
          alert('Maximum stock reached!');
          return prev;
        }
        return prev.map(item => 
          item._id === medicine._id 
            ? { ...item, cartQty: item.cartQty + 1 }
            : item
        );
      }
      return [...prev, { ...medicine, storeId: store, cartQty: 1 }];
    });
  };

  const removeFromCart = (medicineId) => {
    setCartItems(prev => prev.filter(item => item._id !== medicineId));
  };

  const updateQuantity = (medicineId, change) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item._id === medicineId) {
          const newQty = item.cartQty + change;
          if (newQty < 1) return item; // Handled by remove button explicitly if needed
          if (newQty > item.quantity) {
             alert('Maximum stock reached!');
             return item;
          }
          return { ...item, cartQty: newQty };
        }
        return item;
      });
    });
  };

  const applyCoupon = (code) => {
    const upperCode = code.trim().toUpperCase();
    if (upperCode === 'HACK50') {
      setDiscountPercent(50);
      setCouponCode(upperCode);
      return { success: true, message: '50% Flat Discount Applied!' };
    } else if (upperCode === 'FREEDEL') {
      setDiscountPercent(0); // Handled explicitly in totals
      setCouponCode(upperCode);
      return { success: true, message: 'Free Rider Delivery Applied!' };
    }
    return { success: false, message: 'Invalid or expired coupon' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  const clearCart = () => {
    setCartItems([]);
    removeCoupon();
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      deliveryMode,
      setDeliveryMode,
      couponCode,
      applyCoupon,
      removeCoupon,
      discountPercent
    }}>
      {children}
    </CartContext.Provider>
  );
};
