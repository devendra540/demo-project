import { useState, useEffect } from 'react';
import { getMe, updateProfile } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
        setFormData(prev => ({ ...prev, name: data.name }));
      } catch (err) {
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setIsSaving(true);
      const updateData = { name: formData.name };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      // Refresh user data
      const data = await getMe();
      setUser(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="profile-page animate-up">
      <div className="page-header">
        <h2>My Profile</h2>
      </div>

      <div className="profile-grid">
        <div className="glass-card mb-4 profile-info">
          <h3>Account Information</h3>
          <div className="info-row mt-4">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Role:</span>
            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-accent' : ''}`}>{user?.role}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Member Since:</span>
            <span className="info-value">{new Date(user?.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-muted mt-4" style={{ fontSize: '0.9rem' }}>
            To change your email or role, please contact an administrator.
          </p>
        </div>

        <div className="glass-card profile-form">
          <h3>Update Profile</h3>
          
          {error && <div className="error-message mt-3">{error}</div>}
          {success && <div className="success-message mt-3">{success}</div>}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                required 
                className="form-control"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="form-divider">Change Password</div>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>Leave blank to keep your current password.</p>
            
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="form-control"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                className="form-control"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            <div className="form-actions mt-4">
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
