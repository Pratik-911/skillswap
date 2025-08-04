import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Calendar, Clock, User, CheckCircle, XCircle, Star, Plus, Filter } from 'lucide-react';
import './Appointments.css';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookingData, setBookingData] = useState({
    teacherId: '',
    skill: '',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/appointments');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(apt => 
          new Date(apt.scheduledDate) > now && 
          ['pending', 'accepted'].includes(apt.status)
        );
        break;
      case 'past':
        filtered = filtered.filter(apt => 
          new Date(apt.scheduledDate) <= now || 
          ['completed', 'cancelled'].includes(apt.status)
        );
        break;
      case 'teaching':
        filtered = filtered.filter(apt => apt.teacherId._id === user.id);
        break;
      case 'learning':
        filtered = filtered.filter(apt => apt.learnerId._id === user.id);
        break;
      case 'pending':
        filtered = filtered.filter(apt => apt.status === 'pending');
        break;
      default:
        break;
    }

    filtered.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    setFilteredAppointments(filtered);
  };

  const handleStatusUpdate = async (appointmentId, newStatus, notes = '') => {
    try {
      await axios.put(`/appointments/${appointmentId}/status`, {
        status: newStatus,
        notes
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleFeedback = async (appointmentId, rating, feedback) => {
    try {
      await axios.put(`/appointments/${appointmentId}/feedback`, {
        rating,
        feedback
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': 
      case 'cancelled': return <XCircle size={16} />;
      case 'completed': return <Star size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const canUpdateStatus = (appointment) => {
    return appointment.teacherId._id === user.id && 
           appointment.status === 'pending' && 
           isUpcoming(appointment.scheduledDate);
  };

  const canProvideFeedback = (appointment) => {
    return appointment.learnerId._id === user.id && 
           appointment.status === 'completed' && 
           !appointment.rating;
  };

  if (loading) {
    return <div className="loading-spinner">Loading appointments...</div>;
  }

  return (
    <div className="appointments-page">
      <div className="container">
        <div className="appointments-header">
          <div className="header-content">
            <h1>
              <Calendar size={28} />
              My Appointments
            </h1>
            <p>Manage your skill exchange sessions</p>
          </div>
        </div>

        <div className="appointments-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({appointments.length})
            </button>
            <button
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming ({appointments.filter(apt => 
                new Date(apt.scheduledDate) > new Date() && 
                ['pending', 'accepted'].includes(apt.status)
              ).length})
            </button>
            <button
              className={`filter-tab ${filter === 'teaching' ? 'active' : ''}`}
              onClick={() => setFilter('teaching')}
            >
              Teaching ({appointments.filter(apt => apt.teacherId._id === user.id).length})
            </button>
            <button
              className={`filter-tab ${filter === 'learning' ? 'active' : ''}`}
              onClick={() => setFilter('learning')}
            >
              Learning ({appointments.filter(apt => apt.learnerId._id === user.id).length})
            </button>
            <button
              className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past ({appointments.filter(apt => 
                new Date(apt.scheduledDate) <= new Date() || 
                ['completed', 'cancelled'].includes(apt.status)
              ).length})
            </button>
          </div>
        </div>

        <div className="appointments-content">
          {filteredAppointments.length > 0 ? (
            <div className="appointments-list">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <div className="appointment-header">
                    <div className="appointment-date">
                      <div className="date-main">{formatDate(appointment.scheduledDate)}</div>
                      <div className="date-time">
                        <Clock size={14} />
                        {formatTime(appointment.scheduledDate)} ({appointment.duration} min)
                      </div>
                    </div>
                    <div className={`appointment-status ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status}</span>
                    </div>
                  </div>

                  <div className="appointment-body">
                    <div className="appointment-info">
                      <h3>{appointment.title}</h3>
                      <div className="skill-badge">{appointment.skill}</div>
                      {appointment.description && (
                        <p className="appointment-description">{appointment.description}</p>
                      )}
                    </div>

                    <div className="appointment-participants">
                      <div className="participant">
                        <div className="participant-avatar">
                          {appointment.teacherId.avatar ? (
                            <img src={appointment.teacherId.avatar} alt={appointment.teacherId.name} />
                          ) : (
                            appointment.teacherId.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="participant-info">
                          <span className="participant-role">Teacher</span>
                          <span className="participant-name">{appointment.teacherId.name}</span>
                        </div>
                      </div>
                      <div className="participant">
                        <div className="participant-avatar">
                          {appointment.learnerId.avatar ? (
                            <img src={appointment.learnerId.avatar} alt={appointment.learnerId.name} />
                          ) : (
                            appointment.learnerId.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="participant-info">
                          <span className="participant-role">Learner</span>
                          <span className="participant-name">{appointment.learnerId.name}</span>
                        </div>
                      </div>
                    </div>

                    {appointment.meetingLink && (
                      <div className="meeting-link">
                        <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                          Join Meeting
                        </a>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="appointment-notes">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}

                    {appointment.rating && (
                      <div className="appointment-feedback">
                        <div className="rating">
                          <span>Rating: </span>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < appointment.rating ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                        </div>
                        {appointment.feedback && (
                          <p className="feedback-text">{appointment.feedback}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="appointment-actions">
                    {canUpdateStatus(appointment) && (
                      <div className="status-actions">
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'accepted')}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}

                    {appointment.status === 'accepted' && isUpcoming(appointment.scheduledDate) && (
                      <button
                        onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                        className="btn btn-primary btn-sm"
                      >
                        Mark Complete
                      </button>
                    )}

                    {canProvideFeedback(appointment) && (
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="btn btn-outline btn-sm"
                      >
                        <Star size={16} />
                        Rate Session
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={64} />
              <h3>No appointments found</h3>
              <p>
                {filter === 'all' 
                  ? 'You haven\'t scheduled any sessions yet. Start by finding matches and chatting with potential teachers or learners.'
                  : `No ${filter} appointments found. Try adjusting your filter.`
                }
              </p>
              {filter === 'all' && (
                <a href="/matches" className="btn btn-primary">
                  Find Matches
                </a>
              )}
            </div>
          )}
        </div>

        {/* Feedback Modal */}
        {selectedAppointment && (
          <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Rate Your Session</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="modal-close"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="modal-body">
                <FeedbackForm
                  appointment={selectedAppointment}
                  onSubmit={(rating, feedback) => {
                    handleFeedback(selectedAppointment._id, rating, feedback);
                    setSelectedAppointment(null);
                  }}
                  onCancel={() => setSelectedAppointment(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Feedback Form Component
const FeedbackForm = ({ appointment, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, feedback);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <div className="session-info">
        <h4>{appointment.title}</h4>
        <p>with {appointment.teacherId.name}</p>
      </div>

      <div className="rating-section">
        <label>How was your session?</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star size={24} />
            </button>
          ))}
        </div>
      </div>

      <div className="feedback-section">
        <label htmlFor="feedback">Share your experience (optional)</label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How was the session? What did you learn?"
          rows={4}
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={rating === 0} className="btn btn-primary">
          Submit Rating
        </button>
      </div>
    </form>
  );
};

export default Appointments;
