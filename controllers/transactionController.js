const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Add a new transaction
const addTransaction = async (req, res) => {
    const { name, amount, category, type } = req.body;

    // Validate required fields
    if (!name || !amount || !category || !type) {
        return res.status(400).json({ message: 'All fields (name, amount, category, type) are required.' });
    }

    try {
        const transaction = await Transaction.create({
            user: req.user.id,
            name,
            amount,
            category,
            type,
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Server error while creating transaction.' });
    }
};

// Get transactions for the logged-in user
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });
        res.json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error while fetching transactions.' });
    }
};

// Update a transaction
const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { name, amount, category, type } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid transaction ID.' });
    }

    try {
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized to update this transaction.' });
        }

        // Update fields if provided
        transaction.name = name || transaction.name;
        transaction.amount = amount || transaction.amount;
        transaction.category = category || transaction.category;
        transaction.type = type || transaction.type;

        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Server error while updating transaction.' });
    }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid transaction ID.' });
    }

    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            user: req.user.id, // Ensure user owns the transaction
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized.' });
        }

        res.json({ message: 'Transaction deleted successfully!' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Server error while deleting transaction.' });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
};
