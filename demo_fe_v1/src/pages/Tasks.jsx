import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'PENDING' });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openModal = (mode, taskData = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && taskData) {
      setEditingTaskId(taskData.id);
      setFormData({ title: taskData.title, description: taskData.description, status: taskData.status });
    } else {
      setEditingTaskId(null);
      setFormData({ title: '', description: '', status: 'PENDING' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    try {
      if (modalMode === 'add') {
        await createTask(formData);
        setSuccessMsg('Task created successfully');
      } else {
        await updateTask(editingTaskId, formData);
        setSuccessMsg('Task updated successfully');
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        setSuccessMsg('Task deleted successfully');
        fetchTasks();
      } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && !tasks.length) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="tasks-page animate-up">
      <div className="page-header">
        <h2>My Tasks</h2>
        <button className="btn-primary" onClick={() => openModal('add')}>+ Add Task</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <div className="filters-container glass-card mb-4" style={{ display: 'flex', gap: '16px' }}>
        <input 
          type="text" 
          placeholder="Search tasks..." 
          className="form-control flex-grow"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select 
          className="form-select" 
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="glass-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr><td colSpan="4" className="text-center">No tasks found</td></tr>
              ) : (
                filteredTasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <button 
                        className={`status-btn ${t.status === 'COMPLETED' ? 'success' : 'pending'}`}
                        onClick={() => handleToggleStatus(t)}
                        title="Click to toggle status"
                      >
                        {t.status === 'COMPLETED' ? '✓' : '○'}
                      </button>
                    </td>
                    <td><strong style={{ textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none', color: t.status === 'COMPLETED' ? 'var(--text-muted)' : 'inherit' }}>{t.title}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.description}</td>
                    <td className="actions-cell">
                      <button className="btn-icon text-accent" onClick={() => openModal('edit', t)}>Edit</button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(t.id)}>Delete</button>
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
            <h3>{modalMode === 'add' ? 'Add New Task' : 'Edit Task'}</h3>
            {formError && <div className="error-message">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" required className="form-control" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="form-select">
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
