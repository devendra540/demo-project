const db = require('../config/db');

const getTasks = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)',
      [title, description || '', status || 'PENDING', req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, description, status: status || 'PENDING' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

const updateTask = async (req, res) => {
  const { title, description, status } = req.body;
  const taskId = req.params.id;

  try {
    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await db.query(
      'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
      [title || existing[0].title, description || existing[0].description, status || existing[0].status, taskId]
    );

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

const deleteTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
