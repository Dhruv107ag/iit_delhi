import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import StoreFront from './pages/StoreFront';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main className="main-content" style={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/search" element={<Search />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/store-dashboard" element={<Dashboard />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/store/:id" element={<StoreFront />} />
                <Route path="*" element={<Landing />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
