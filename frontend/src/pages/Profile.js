import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, BookOpen, PlusCircle, X, Save } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    skillsToTeach: [],
    skillsToLearn: []
  });
  const [newSkill, setNewSkill] = useState({ teach: '', learn: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        skillsToTeach: user.skillsToTeach || [],
        skillsToLearn: user.skillsToLearn || []
      });
      
      // If user has no skills set, automatically enter edit mode
      if (!user.skillsToTeach?.length && !user.skillsToLearn?.length) {
        setIsEditing(true);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = (type) => {
    const skill = newSkill[type].trim();
    if (skill && !formData[`skillsTo${type === 'teach' ? 'Teach' : 'Learn'}`].includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [`skillsTo${type === 'teach' ? 'Teach' : 'Learn'}`]: [
          ...prev[`skillsTo${type === 'teach' ? 'Teach' : 'Learn'}`],
          skill
        ]
      }));
      setNewSkill(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeSkill = (type, skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      [`skillsTo${type === 'teach' ? 'Teach' : 'Learn'}`]: prev[`skillsTo${type === 'teach' ? 'Teach' : 'Learn'}`].filter(
        skill => skill !== skillToRemove
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        skillsToTeach: user.skillsToTeach || [],
        skillsToLearn: user.skillsToLearn || []
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            {user.location && (
              <div className="profile-location">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
            )}
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                <User size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location" className="form-label">Location (Optional)</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="City, Country"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="bio" className="form-label">Bio (Optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-input form-textarea"
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                    disabled={loading}
                  />
                  <div className="character-count">
                    {formData.bio.length}/500 characters
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Skills I Can Teach</h3>
                <div className="skills-input">
                  <input
                    type="text"
                    value={newSkill.teach}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, teach: e.target.value }))}
                    className="form-input"
                    placeholder="Add a skill you can teach..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('teach'))}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('teach')}
                    className="btn btn-secondary"
                    disabled={!newSkill.teach.trim() || loading}
                  >
                    <PlusCircle size={18} />
                    Add
                  </button>
                </div>
                <div className="skills-list">
                  {formData.skillsToTeach.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill('teach', skill)}
                        className="skill-remove"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Skills I Want to Learn</h3>
                <div className="skills-input">
                  <input
                    type="text"
                    value={newSkill.learn}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, learn: e.target.value }))}
                    className="form-input"
                    placeholder="Add a skill you want to learn..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('learn'))}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('learn')}
                    className="btn btn-secondary"
                    disabled={!newSkill.learn.trim() || loading}
                  >
                    <PlusCircle size={18} />
                    Add
                  </button>
                </div>
                <div className="skills-list">
                  {formData.skillsToLearn.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill('learn', skill)}
                        className="skill-remove"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <div className="profile-view">
              <div className="profile-section">
                <h3>About</h3>
                <p className="profile-bio">
                  {user.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                </p>
              </div>

              <div className="profile-section">
                <h3>
                  <BookOpen size={20} />
                  Skills I Can Teach ({user.skillsToTeach?.length || 0})
                </h3>
                <div className="skills-display">
                  {user.skillsToTeach?.length > 0 ? (
                    user.skillsToTeach.map((skill, index) => (
                      <span key={index} className="skill-badge skill-teach">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="no-skills">No teaching skills added yet.</p>
                  )}
                </div>
              </div>

              <div className="profile-section">
                <h3>
                  <BookOpen size={20} />
                  Skills I Want to Learn ({user.skillsToLearn?.length || 0})
                </h3>
                <div className="skills-display">
                  {user.skillsToLearn?.length > 0 ? (
                    user.skillsToLearn.map((skill, index) => (
                      <span key={index} className="skill-badge skill-learn">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="no-skills">No learning skills added yet.</p>
                  )}
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{user.rating || 0}</span>
                  <span className="stat-label">Rating</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.totalSessions || 0}</span>
                  <span className="stat-label">Sessions</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
