import { useState, useEffect } from 'react';
import api from '../api';
import { SearchIcon, MapPin, Pill, Star, Clock } from 'lucide-react';
import './Search.css';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [queryType, setQueryType] = useState('medicines'); // medicines, stores, doctors
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch to populate something
    handleSearch();
  }, [queryType]);

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      if (queryType === 'medicines') endpoint = `/medicines/search?name=${searchTerm}`;
      else if (queryType === 'stores') endpoint = `/stores`; // If no dedicated search, fetch all and filter client side
      else if (queryType === 'doctors') endpoint = `/doctors`;

      const response = await api.get(endpoint);
      
      let dataList = [];
      // Flatten depending on how backend sends it
      if (response.data.data) {
         dataList = response.data.data;
      } else if (Array.isArray(response.data)) {
         dataList = response.data;
      } else if (response.data.medicines) {
         dataList = response.data.medicines;
      } else if (response.data.stores) {
         dataList = response.data.stores;
      } else if (response.data.doctors) {
         dataList = response.data.doctors;
      }

      // Client side fallback filter if API didn't filter
      if (searchTerm && queryType !== 'medicines') {
        const lowerTerm = searchTerm.toLowerCase();
        dataList = dataList.filter(item => 
          item.name?.toLowerCase().includes(lowerTerm) || 
          item.specialization?.toLowerCase().includes(lowerTerm) ||
          item.address?.toLowerCase().includes(lowerTerm)
        );
      }
      
      setResults(dataList || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
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
                    <>
                      <div className="card-badge success">
                        <Pill size={14} /> ₹{item.price}
                      </div>
                      <h3 className="card-title">{item.name}</h3>
                      <p className="card-desc text-sm mb-2">{item.composition || 'Standard formulation'}</p>
                      
                      <div className="card-footer space-between">
                         <span className="stock-info text-success font-medium">
                           {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                         </span>
                         <span className="store-link text-primary text-sm flex gap-1">
                           <MapPin size={14}/> View Store
                         </span>
                      </div>
                    </>
                  )}

                  {queryType === 'stores' && (
                    <>
                      <div className="card-badge primary">Verified Store</div>
                      <h3 className="card-title">{item.name}</h3>
                      <p className="card-desc flex gap-2 text-sm text-muted mb-2">
                        <MapPin size={16} /> {item.address}
                      </p>
                      <p className="card-desc flex gap-2 text-sm text-muted">
                        <Clock size={16} /> {item.openingTime} - {item.closingTime}
                      </p>
                    </>
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
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
