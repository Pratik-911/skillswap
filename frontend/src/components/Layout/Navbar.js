import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, MessageCircle, Calendar, Users, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
          <span className="brand-text">SkillSwap</span>
        </Link>

        {user ? (
          <>
            {/* Desktop Navigation */}
            <div className="navbar-nav desktop-nav">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <Users size={18} />
                Dashboard
              </Link>
              <Link 
                to="/matches" 
                className={`nav-link ${isActive('/matches') ? 'active' : ''}`}
              >
                <Users size={18} />
                Matches
              </Link>
              <Link 
                to="/chat" 
                className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
              >
                <MessageCircle size={18} />
                Messages
              </Link>
              <Link 
                to="/appointments" 
                className={`nav-link ${isActive('/appointments') ? 'active' : ''}`}
              >
                <Calendar size={18} />
                Appointments
              </Link>
            </div>

            {/* User Menu */}
            <div className="navbar-user">
              <div className="user-info">
                <div className="avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <User size={16} />
                  Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
              <Link 
                to="/dashboard" 
                className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={18} />
                Dashboard
              </Link>
              <Link 
                to="/matches" 
                className={`mobile-nav-link ${isActive('/matches') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={18} />
                Matches
              </Link>
              <Link 
                to="/chat" 
                className={`mobile-nav-link ${isActive('/chat') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle size={18} />
                Messages
              </Link>
              <Link 
                to="/appointments" 
                className={`mobile-nav-link ${isActive('/appointments') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar size={18} />
                Appointments
              </Link>
              <Link 
                to="/profile" 
                className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} />
                Profile
              </Link>
              <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="navbar-nav">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
