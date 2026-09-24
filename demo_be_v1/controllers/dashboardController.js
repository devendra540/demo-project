const db = require('../config/db');

const getSummary = async (req, res) => {
  try {
    const [[usersResult]] = await db.query('SELECT COUNT(*) as count FROM users');
    const [[tasksResult]] = await db.query('SELECT COUNT(*) as count FROM tasks');
    const [[completedTasksResult]] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = ?', ['COMPLETED']);
    const [[pendingTasksResult]] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = ?', ['PENDING']);

    res.json({
      totalUsers: usersResult.count,
      totalTasks: tasksResult.count,
      completedTasks: completedTasksResult.count,
      pendingTasks: pendingTasksResult.count
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Server error fetching dashboard summary' });
  }
};

module.exports = { getSummary };
