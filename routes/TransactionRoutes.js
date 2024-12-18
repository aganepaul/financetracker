const express = require('express');
const router = express.Router();
const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.post('/', protect, addTransaction); // Add a new transaction
router.get('/', protect, getTransactions); // Get all transactions for the logged-in user
router.delete('/:id', protect, deleteTransaction); // Delete a specific transaction by ID
router.put('/:id', protect, updateTransaction); // Update a specific transaction by ID

module.exports = router;
