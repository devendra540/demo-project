import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getMe } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const me = await getMe();
      setCurrentUser(me);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (mode, userData = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && userData) {
      setEditingUserId(userData.id);
      setFormData({ name: userData.name, email: userData.email, password: '', role: userData.role });
    } else {
      setEditingUserId(null);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'USER' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    try {
      if (modalMode === 'add') {
        await createUser(formData);
        setSuccessMsg('User created successfully');
      } else {
        await updateUser(editingUserId, formData);
        setSuccessMsg('User updated successfully');
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setSuccessMsg('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !users.length) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="users-page animate-up">
      <div className="page-header">
        <h2>User Management</h2>
        <button className="btn-primary" onClick={() => openModal('add')}>+ Add User</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}
      {formError && !isModalOpen && <div className="error-message">{formError}</div>}

      <div className="glass-card mb-4">
        <input 
          type="text" 
          placeholder="Search users..." 
          className="form-control"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="text-center">No users found</td></tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-accent' : ''}`}>{u.role}</span></td>
                    <td className="actions-cell">
                      <button className="btn-icon text-accent" onClick={() => openModal('edit', u)}>Edit</button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(u.id)} disabled={u.id === currentUser?.id}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-up">
            <h3>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h3>
            {formError && <div className="error-message">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" required className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="form-select">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password {modalMode === 'edit' && <small>(Leave blank to keep current)</small>}</label>
                <input type="password" required={modalMode === 'add'} className="form-control" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
