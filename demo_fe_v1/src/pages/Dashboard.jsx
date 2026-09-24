import { useState, useEffect } from 'react';
import { getMe, getDashboardSummary } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getMe();
        setUser(userData);
        
        const summaryData = await getDashboardSummary();
        setSummary(summaryData);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-content">
      <div className="welcome-section glass-card animate-up">
        <h1>Welcome back, {user?.name}</h1>
        <div className="user-details">
          <span className="badge">Email: {user?.email}</span>
          <span className="badge badge-accent">Role: {user?.role}</span>
        </div>
      </div>

      <div className="stats-grid mt-4">
        <div className="stat-card glass-card animate-up delay-1">
          <h3>Total Users</h3>
          <div className="stat-value">{summary?.totalUsers}</div>
          <p className="stat-desc">Registered accounts</p>
        </div>
        
        <div className="stat-card glass-card animate-up delay-1">
          <h3>Total Tasks</h3>
          <div className="stat-value">{summary?.totalTasks}</div>
          <p className="stat-desc">Across all users</p>
        </div>

        <div className="stat-card glass-card animate-up delay-2">
          <h3>Completed Tasks</h3>
          <div className="stat-value text-success">{summary?.completedTasks}</div>
          <p className="stat-desc">Successfully finished</p>
        </div>

        <div className="stat-card glass-card animate-up delay-2">
          <h3>Pending Tasks</h3>
          <div className="stat-value text-accent">{summary?.pendingTasks}</div>
          <p className="stat-desc">Awaiting completion</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
