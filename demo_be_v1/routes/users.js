const express = require('express');
const router = express.Router();
const { 
  getUserCount, 
  getAllUsers, 
  createUser, 
  getUserById, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/count', protect, getUserCount);

router.route('/')
  .get(protect, getAllUsers)
  .post(protect, createUser);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;
