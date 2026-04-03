import { useEffect, useRef } from 'react';
import { Search, Pill, ShieldCheck, Clock, MapPin } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import './Landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero Animation
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.from(".hero-badge", { y: -20, opacity: 0, duration: 0.6 })
        .from(".hero-title span", { y: 40, opacity: 0, duration: 0.8, stagger: 0.15 }, "-=0.2")
        .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-search-box", { scale: 0.95, opacity: 0, duration: 0.6, clearProps: "all" }, "-=0.2")
        .from(".hero-stats .stat-item", { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.2");

      // Features Scroll Animation
      gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
          y: 50,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "back.out(1.2)",
          clearProps: "all"
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-page" ref={heroRef}>
      {/* Hero Section */}
      <section className="hero section">
        <div className="container hero-content">
          <div className="hero-text-area">
            <div className="hero-badge">
              <ShieldCheck size={16} />
              Verified Pharmacies & Doctors
            </div>
            
            <h1 className="hero-title">
              <span>Your Health.</span>
              <span>Our Priority.</span>
              <span className="text-gradient">Local Care.</span>
            </h1>
            
            <p className="hero-subtitle">
              Find essential medicines, locate 24/7 pharmacies, and book expert doctors instantly in your neighborhood.
            </p>

            <div className="hero-search-box glass-panel">
              <Search className="search-icon" size={24} color="var(--color-primary)" />
              <input 
                type="text" 
                placeholder="Search for medicines, doctors, or stores..." 
                className="hero-input"
              />
              <Link to="/search?tab=medicines" className="btn btn-primary search-btn">Find Now</Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h3>500+</h3>
                <p>Pharmacies</p>
              </div>
              <div className="stat-item">
                <h3>10k+</h3>
                <p>Medicines</p>
              </div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>Support</p>
              </div>
            </div>
          </div>
          
          <div className="hero-image-area">
            {/* Abstract visual representing medical connectivity */}
            <div className="abstract-shape shape-1"></div>
            <div className="abstract-shape shape-2"></div>
            <div className="glass-panel image-card">
              <div className="card-mock header-mock"></div>
              <div className="card-mock body-mock"></div>
              <div className="card-mock body-mock short"></div>
              <div className="floating-badge badge-1 glass-panel">
                <Pill size={20} color="var(--color-success)" /> Available Now
              </div>
              <div className="floating-badge badge-2 glass-panel">
                <MapPin size={20} color="var(--color-primary)" /> 0.5 Miles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section" ref={featuresRef}>
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why Choose MediConnect?</h2>
            <p className="section-desc">We bridge the gap between patients and essential healthcare providers.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper" style={{background: 'var(--color-primary-light)'}}>
                <Search size={28} color="var(--color-primary-dark)" />
              </div>
              <h3>Real-time Availability</h3>
              <p>Check if a specific medicine is in stock at nearby pharmacies before leaving your home.</p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper" style={{background: 'var(--color-success-light)'}}>
                <ShieldCheck size={28} color="var(--color-success-dark)" />
              </div>
              <h3>Verified Partners</h3>
              <p>All stores and doctors are verified to ensure authentic medicines and reliable medical advice.</p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper" style={{background: '#fef3c7'}}>
                <Clock size={28} color="#d97706" />
              </div>
              <h3>Timely Assistance</h3>
              <p>Easily filter 24/7 pharmacies for late-night emergencies and urgent healthcare needs.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action for Stores */}
      <section className="cta section container">
        <div className="cta-card glass-panel text-center">
          <h2>Own a Pharmacy or Clinic?</h2>
          <p>Join the MediConnect network, manage your stock efficiently, and reach more patients in your locality.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary">Register Your Store</Link>
            <Link to="/login" className="btn btn-outline">Store Login</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
