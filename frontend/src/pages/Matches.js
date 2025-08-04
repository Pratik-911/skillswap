import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Users, MessageCircle, Calendar, Star, Filter, Search, BookOpen } from 'lucide-react';
import './Matches.css';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterAndSortMatches();
  }, [matches, searchTerm, filterType, sortBy]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/matches');
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMatches = () => {
    let filtered = [...matches];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(match =>
        match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.commonSkills.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by match type
    if (filterType !== 'all') {
      filtered = filtered.filter(match => match.matchType === filterType);
    }

    // Sort matches
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'rating':
          return (b.user.rating || 0) - (a.user.rating || 0);
        case 'sessions':
          return (b.user.totalSessions || 0) - (a.user.totalSessions || 0);
        case 'name':
          return a.user.name.localeCompare(b.user.name);
        default:
          return 0;
      }
    });

    setFilteredMatches(filtered);
  };

  const getMatchTypeInfo = (matchType) => {
    switch (matchType) {
      case 'mutual':
        return {
          label: 'Mutual Exchange',
          description: 'Can teach you and wants to learn from you',
          color: 'match-mutual',
          icon: '🤝'
        };
      case 'teacher':
        return {
          label: 'Can Teach You',
          description: 'Has skills you want to learn',
          color: 'match-teacher',
          icon: '👨‍🏫'
        };
      case 'learner':
        return {
          label: 'Wants to Learn',
          description: 'Wants to learn skills you can teach',
          color: 'match-learner',
          icon: '🎓'
        };
      default:
        return {
          label: 'Match',
          description: 'Skill exchange opportunity',
          color: 'match-default',
          icon: '✨'
        };
    }
  };

  const handleBookSession = (match) => {
    // This would typically open a booking modal
    // For now, we'll redirect to chat to discuss scheduling
    window.location.href = `/chat/${match.user._id}`;
  };

  if (loading) {
    return <div className="loading-spinner">Loading matches...</div>;
  }

  return (
    <div className="matches-page">
      <div className="container">
        <div className="matches-header">
          <div className="header-content">
            <h1>
              <Users size={28} />
              Your Skill Matches
            </h1>
            <p>Connect with people who can teach you new skills or learn from your expertise</p>
          </div>
          
          {(!user?.skillsToTeach?.length || !user?.skillsToLearn?.length) && (
            <div className="setup-prompt">
              <BookOpen size={20} />
              <div>
                <h3>Complete your profile to find matches</h3>
                <p>Add skills you can teach and want to learn</p>
              </div>
              <Link to="/profile" className="btn btn-primary">
                Setup Profile
              </Link>
            </div>
          )}
        </div>

        {matches.length > 0 && (
          <div className="matches-controls">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <Filter size={16} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Matches</option>
                  <option value="mutual">Mutual Exchange</option>
                  <option value="teacher">Can Teach Me</option>
                  <option value="learner">Wants to Learn</option>
                </select>
              </div>
              
              <div className="filter-group">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="score">Match Score</option>
                  <option value="rating">Rating</option>
                  <option value="sessions">Experience</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="matches-content">
          {filteredMatches.length > 0 ? (
            <div className="matches-grid">
              {filteredMatches.map((match, index) => {
                const matchInfo = getMatchTypeInfo(match.matchType);
                
                return (
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
                        <h3>{match.user.name}</h3>
                        <div className={`match-type ${matchInfo.color}`}>
                          <span className="match-icon">{matchInfo.icon}</span>
                          {matchInfo.label}
                        </div>
                        <p className="match-description">{matchInfo.description}</p>
                      </div>
                      <div className="match-stats">
                        {match.user.rating > 0 && (
                          <div className="stat">
                            <Star size={14} />
                            <span>{match.user.rating}</span>
                          </div>
                        )}
                        {match.user.totalSessions > 0 && (
                          <div className="stat">
                            <span className="stat-label">{match.user.totalSessions} sessions</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="match-body">
                      <div className="skills-section">
                        <h4>Common Skills</h4>
                        <div className="skills-list">
                          {match.commonSkills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {match.matchType === 'mutual' && match.wantsToLearnFromMe && (
                        <div className="skills-section">
                          <h4>They want to learn</h4>
                          <div className="skills-list">
                            {match.wantsToLearnFromMe.map((skill, skillIndex) => (
                              <span key={skillIndex} className="skill-tag skill-secondary">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {match.user.bio && (
                        <div className="match-bio">
                          <p>{match.user.bio}</p>
                        </div>
                      )}
                    </div>

                    <div className="match-actions">
                      <Link
                        to={`/chat/${match.user._id}`}
                        className="btn btn-primary"
                      >
                        <MessageCircle size={16} />
                        Start Chat
                      </Link>
                      <button
                        onClick={() => handleBookSession(match)}
                        className="btn btn-outline"
                      >
                        <Calendar size={16} />
                        Book Session
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : matches.length > 0 ? (
            <div className="no-results">
              <Search size={48} />
              <h3>No matches found</h3>
              <p>Try adjusting your search terms or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <Users size={64} />
              <h3>No matches yet</h3>
              <p>
                {!user?.skillsToTeach?.length || !user?.skillsToLearn?.length
                  ? 'Complete your profile to start finding skill exchange partners'
                  : 'We\'ll find matches for you as more users join the platform'
                }
              </p>
              {(!user?.skillsToTeach?.length || !user?.skillsToLearn?.length) && (
                <Link to="/profile" className="btn btn-primary">
                  Complete Profile
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;
