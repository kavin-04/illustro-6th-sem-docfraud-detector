import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="logo-text">DocsFraud Detector</div>
        <div className="menu-container">
          <button className="menu-button" onClick={toggleMenu}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className={`navigation ${menuOpen ? 'open' : ''}`}>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <div className="logo-circle-container">
            <div className="logo-circle">
              <img 
                src="/logo.jpeg"
                alt="DocsFraud Detector Logo" 
                className="logo-image"
              />
            </div>
          </div>
          
          <div className="hero-text">
            <h1>Protect Your Business With Advanced Document Verification</h1>
            <p>Our AI-powered solution detects fraudulent documents by verifying logos, signatures, and more with cutting-edge OCR technology.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button primary">Get Started</Link>
              <Link to="/login" className="cta-button secondary">Log In</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;