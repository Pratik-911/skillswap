import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Users, MessageCircle, Calendar, BookOpen, TrendingUp, Clock, Star } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMatches: 0,
    unreadMessages: 0,
    upcomingAppointments: 0,
    completedSessions: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch matches
      const matchesResponse = await axios.get('/matches');
      const matches = matchesResponse.data.matches || [];
      
      // Fetch appointments
      const appointmentsResponse = await axios.get('/appointments');
      const appointments = appointmentsResponse.data.appointments || [];
      
      // Fetch conversations for unread count
      const conversationsResponse = await axios.get('/messages/conversations');
      const conversations = conversationsResponse.data.conversations || [];
      
      // Calculate stats
      const now = new Date();
      const upcomingAppts = appointments.filter(apt => 
        new Date(apt.scheduledDate) > now && 
        ['pending', 'accepted'].includes(apt.status)
      );
      const completedAppts = appointments.filter(apt => apt.status === 'completed');
      const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      
      setStats({
        totalMatches: matches.length,
        unreadMessages: unreadCount,
        upcomingAppointments: upcomingAppts.length,
        completedSessions: completedAppts.length
      });
      
      setRecentMatches(matches.slice(0, 6));
      setUpcomingAppointments(upcomingAppts.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchTypeColor = (matchType) => {
    switch (matchType) {
      case 'mutual': return 'match-mutual';
      case 'teacher': return 'match-teacher';
      case 'learner': return 'match-learner';
      default: return 'match-default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Here's what's happening with your skill exchanges</p>
          </div>
          
          {(!user?.skillsToTeach?.length || !user?.skillsToLearn?.length) && (
            <div className="setup-prompt">
              <div className="prompt-content">
                <BookOpen size={24} />
                <div>
                  <h3>Complete your profile</h3>
                  <p>Add skills you can teach and want to learn to find matches</p>
                </div>
                <Link to="/profile" className="btn btn-primary">
                  Setup Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalMatches}</div>
              <div className="stat-label">Total Matches</div>
            </div>
            <Link to="/matches" className="stat-link">View all</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MessageCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.unreadMessages}</div>
              <div className="stat-label">Unread Messages</div>
            </div>
            <Link to="/chat" className="stat-link">Open chat</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.upcomingAppointments}</div>
              <div className="stat-label">Upcoming Sessions</div>
            </div>
            <Link to="/appointments" className="stat-link">View schedule</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.completedSessions}</div>
              <div className="stat-label">Completed Sessions</div>
            </div>
            <Link to="/appointments" className="stat-link">View history</Link>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Matches */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Users size={20} />
                Recent Matches
              </h2>
              <Link to="/matches" className="section-link">View all matches</Link>
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="matches-grid">
                {recentMatches.map((match, index) => (
                  <div key={index} className="match-card">
                    <div className="match-header">
                      <div className="match-avatar">
                        {match.user.avatar ? (
                          <img src={match.user.avatar} alt={match.user.name} />
                        ) : (
                          match.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="match-info">
                        <h4>{match.user.name}</h4>
                        <div className={`match-type ${getMatchTypeColor(match.matchType)}`}>
                          {match.matchType === 'mutual' ? 'Mutual Exchange' :
                           match.matchType === 'teacher' ? 'Can Teach You' : 'Wants to Learn'}
                        </div>
                      </div>
                      {match.user.rating > 0 && (
                        <div className="match-rating">
                          <Star size={14} />
                          <span>{match.user.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="match-skills">
                      {match.commonSkills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {match.commonSkills.length > 3 && (
                        <span className="skill-more">+{match.commonSkills.length - 3} more</span>
                      )}
                    </div>
                    <div className="match-actions">
                      <Link 
                        to={`/chat/${match.user._id}`} 
                        className="btn btn-primary btn-sm"
                      >
                        <MessageCircle size={16} />
                        Message
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <h3>No matches yet</h3>
                <p>Complete your profile to start finding skill exchange partners</p>
                <Link to="/profile" className="btn btn-primary">
                  Setup Profile
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Calendar size={20} />
                Upcoming Sessions
              </h2>
              <Link to="/appointments" className="section-link">View all appointments</Link>
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="appointments-list">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-time">
                      <Clock size={16} />
                      <span>{formatDate(appointment.scheduledDate)}</span>
                    </div>
                    <div className="appointment-content">
                      <h4>{appointment.title}</h4>
                      <p className="appointment-skill">{appointment.skill}</p>
                      <div className="appointment-participants">
                        <span>
                          {appointment.teacherId._id === user.id ? 
                            `Teaching ${appointment.learnerId.name}` :
                            `Learning from ${appointment.teacherId.name}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>No upcoming sessions</h3>
                <p>Book a session with your matches to start learning</p>
                <Link to="/matches" className="btn btn-primary">
                  Find Matches
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
