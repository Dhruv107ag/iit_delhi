import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { SearchIcon, MapPin, Pill, Star, Clock } from 'lucide-react';
import './Search.css';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [queryType, setQueryType] = useState(searchParams.get('tab') || 'medicines');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [reviewDoctor, setReviewDoctor] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Read tab from URL query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['medicines', 'stores', 'doctors'].includes(tab)) {
      setQueryType(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    handleSearch();
  }, [queryType]);

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      if (queryType === 'medicines') {
        endpoint = searchTerm ? `/medicines/search?q=${searchTerm}` : `/medicines`;
      } else if (queryType === 'stores') {
        endpoint = searchTerm ? `/stores/search?q=${searchTerm}` : `/stores`;
      } else if (queryType === 'doctors') {
        endpoint = searchTerm ? `/doctors/search?q=${searchTerm}` : `/doctors`;
      }

      const { data } = await api.get(endpoint);
      
      // Standardize data extraction from different possible response formats
      let dataList = [];
      if (Array.isArray(data)) {
        dataList = data;
      } else if (data.data && Array.isArray(data.data)) {
        dataList = data.data;
      } else if (data.medicines || data.stores || data.doctors) {
        dataList = data.medicines || data.stores || data.doctors;
      }
      
      setResults(dataList || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (doctorId) => {
    setBookingLoading(doctorId);
    try {
      await api.post('/appointments', {
        doctorId,
        appointmentDate: new Date(),
        reason: 'Consultation'
      });
      alert('Appointment booked successfully! You can now chat with the doctor in your dashboard.');
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired or you are not a patient. Please log in as a patient again.');
      } else {
        alert(err.response?.data?.message || 'Error booking appointment. Ensure you are logged in as a patient.');
      }
    } finally {
      setBookingLoading(null);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewDoctor) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        type: 'doctor',
        doctorId: reviewDoctor._id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      alert('Thank you for your feedback!');
      setReviewDoctor(null);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="search-page pb-16">
      <div className="search-header">
        <div className="container text-center">
          <h1 className="search-title">Discover Healthcare Hubs</h1>
          <p className="search-subtitle">Search for availability of critical medicines, trusted doctors, and local pharmacies.</p>
          
          <form onSubmit={handleSearch} className="search-bar glass-panel shadow-lg">
            <select 
              className="search-select" 
              value={queryType} 
              onChange={(e) => setQueryType(e.target.value)}
            >
              <option value="medicines">Medicines</option>
              <option value="stores">Pharmacies</option>
              <option value="doctors">Doctors</option>
            </select>
            
            <input 
              type="text" 
              className="search-input"
              placeholder={`Search for ${queryType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <button type="submit" className="search-submit btn-primary">
              <SearchIcon size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="container mt-8">
        {loading ? (
          <div className="loading-state">
             <div className="loader"></div>
             <p>Searching...</p>
          </div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="results-grid">
            {results.length === 0 ? (
              <div className="empty-state">
                <SearchIcon size={48} className="empty-icon text-muted" />
                <h3>No results found</h3>
                <p>Try adjusting your search criteria or explore different categories.</p>
              </div>
            ) : (
              results.map((item, idx) => (
                <div key={item._id || idx} className="result-card glass-panel hover-grow">
                  
                  {queryType === 'medicines' && (
                    <Link to={`/store/${item.storeId?._id || item.storeId}`} style={{textDecoration:'none', color:'inherit'}}>
                      <div className="card-badge success">
                        <Pill size={14} /> ₹{item.price}
                      </div>
                      <h3 className="card-title">{item.name}</h3>
                      <p className="card-desc text-sm mb-2">{item.composition || 'Standard formulation'}</p>
                      
                      <div className="card-footer space-between">
                         <span className="stock-info text-success font-medium">
                           {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                         </span>
                         <span className="store-link text-primary text-sm flex gap-1 items-center" style={{fontWeight: 600}}>
                           <MapPin size={14}/> View Store
                         </span>
                      </div>
                    </Link>
                  )}

                  {queryType === 'stores' && (
                    <Link to={`/store/${item._id}`} style={{textDecoration:'none', color:'inherit', display:'block', height:'100%'}}>
                      <div className="card-badge primary">Verified Store</div>
                      <h3 className="card-title">{item.name}</h3>
                      <p className="card-desc flex gap-2 text-sm text-muted mb-2">
                        <MapPin size={16} /> {item.address}
                      </p>
                      <p className="card-desc flex gap-2 text-sm text-muted">
                        <Clock size={16} /> {item.openingTime} - {item.closingTime}
                      </p>
                      <div className="card-footer" style={{marginTop:'1rem', borderTop:'1px dashed #cbd5e1', paddingTop:'1rem'}}>
                         <span className="text-primary font-medium flex items-center gap-1">Visit Pharmacy ➔</span>
                      </div>
                    </Link>
                  )}

                  {queryType === 'doctors' && (
                    <>
                      <h3 className="card-title flex gap-2 align-center">
                        {item.name} <Star size={16} className="text-warning fill-current" color="#f59e0b" fill="#f59e0b" />
                      </h3>
                      <p className="card-desc text-primary font-medium mb-1">{item.specialization}</p>
                      <p className="card-desc text-sm text-muted mb-4">{item.experience} experience</p>
                      
                      <div className="card-footer bg-light p-3 rounded">
                        <p className="text-sm flex gap-2 mb-1"><Clock size={14}/> {item.timing}</p>
                        <span className={`badge ${item.availability ? 'bg-success' : 'bg-danger'} text-white`}>
                          {item.availability ? 'Available for booking' : 'Currently Unavailable'}
                        </span>
                      </div>
                      <div className="card-actions mt-3 flex gap-2">
                        <button 
                          className="btn btn-primary btn-sm flex-1" 
                          onClick={() => handleBookAppointment(item._id)}
                          disabled={bookingLoading === item._id || !item.availability}
                        >
                          {bookingLoading === item._id ? 'Booking...' : 'Book Now'}
                        </button>
                        <button 
                          className="btn btn-outline btn-sm flex-1"
                          onClick={() => setReviewDoctor(item)}
                        >
                          Review
                        </button>
                        <Link to={`/consultation/${item._id}`} className="btn btn-outline btn-sm flex-1">Chat</Link>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {reviewDoctor && (
        <div className="review-modal-overlay">
          <div className="review-modal glass-panel fade-in">
            <div className="modal-header">
              <h3>Review Dr. {reviewDoctor.name}</h3>
              <button className="close-btn" onClick={() => setReviewDoctor(null)}>&times;</button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="rating-select mb-4">
                <label>Your Rating</label>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map(num => (
                    <Star 
                      key={num} 
                      size={24} 
                      onClick={() => setNewReview({...newReview, rating: num})}
                      className={`cursor-pointer ${num <= newReview.rating ? 'text-warning fill-current' : 'text-slate-300'}`}
                      fill={num <= newReview.rating ? "#f59e0b" : "none"}
                    />
                  ))}
                </div>
              </div>
              <textarea 
                className="review-textarea mb-4"
                placeholder="Share your experience with this doctor..."
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                required
              />
              <button type="submit" className="btn btn-primary w-full" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
