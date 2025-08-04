import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Calendar, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const features = [
    {
      icon: <Users size={24} />,
      title: 'Smart Matching',
      description: 'Find the perfect skill exchange partners based on what you can teach and want to learn.'
    },
    {
      icon: <MessageCircle size={24} />,
      title: 'Real-time Chat',
      description: 'Connect instantly with your matches through our built-in messaging system.'
    },
    {
      icon: <Calendar size={24} />,
      title: 'Easy Scheduling',
      description: 'Book and manage learning sessions with an intuitive appointment system.'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Skill Tracking',
      description: 'Track your learning progress and teaching sessions in one place.'
    }
  ];

  const benefits = [
    'Completely free to use',
    'No financial transactions',
    'Learn from real experts',
    'Build meaningful connections',
    'Flexible scheduling',
    'Safe and secure platform'
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Exchange Skills, Build Community
            </h1>
            <p className="hero-subtitle">
              Connect with people who can teach you new skills while sharing your own expertise. 
              No money involved - just pure knowledge exchange.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="card-header">
                <div className="avatar">J</div>
                <div>
                  <h4>John teaches</h4>
                  <p>Web Development</p>
                </div>
              </div>
              <div className="card-body">
                <p>Wants to learn: Photography</p>
              </div>
            </div>
            <div className="hero-card">
              <div className="card-header">
                <div className="avatar">S</div>
                <div>
                  <h4>Sarah teaches</h4>
                  <p>Photography</p>
                </div>
              </div>
              <div className="card-body">
                <p>Wants to learn: Web Development</p>
              </div>
            </div>
            <div className="match-indicator">
              <CheckCircle size={16} />
              Perfect Match!
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>How SkillSwap Works</h2>
            <p>Simple steps to start your skill exchange journey</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2>Why Choose SkillSwap?</h2>
              <p>
                Join thousands of learners and teachers who are building a community 
                based on knowledge sharing and mutual growth.
              </p>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <CheckCircle size={20} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="benefits-stats">
              <div className="stat-card">
                <h3>1000+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-card">
                <h3>500+</h3>
                <p>Skills Available</p>
              </div>
              <div className="stat-card">
                <h3>2000+</h3>
                <p>Sessions Completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Join our community today and discover the joy of skill exchange</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Join SkillSwap Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>SkillSwap</h3>
              <p>Connecting learners and teachers worldwide</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Platform</h4>
                <Link to="/register">Get Started</Link>
                <Link to="/login">Sign In</Link>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
