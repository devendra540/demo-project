const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getUserCount = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user count' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'USER']
    );

    res.status(201).json({ id: result.insertId, name, email, role: role || 'USER' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating user' });
  }
};

const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

const updateUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  const userId = req.params.id;

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = 'UPDATE users SET name = ?, email = ?, role = ?';
    let params = [name || existing[0].name, email || existing[0].email, role || existing[0].role];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    await db.query(query, params);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = { getUserCount, getAllUsers, createUser, getUserById, updateUser, deleteUser };
