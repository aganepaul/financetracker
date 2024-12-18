document.addEventListener('DOMContentLoaded', () => {
    const API_URL = "/api";

    // Registration Form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful!');
                console.log('Registered user:', data);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to the server.');
        }
    });

    // Login Form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token); // Save JWT token
                alert('Login successful!');
                console.log('Logged in user:', data);
                showDashboard();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to the server.');
        }
    });

    // Add Transaction
    document.getElementById('add-transaction-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to add a transaction.');
            return;
        }

        const name = document.getElementById('transaction-name').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);

        const category = 'General'; // Default category
        const type = amount > 0 ? 'income' : 'expense';

        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, amount, category, type }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Transaction added successfully!');
                console.log('New transaction:', data);
                fetchTransactions(); // Refresh transactions list
                clearTransactionForm();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to the server.');
        }
    });

    // Fetch Transactions
    async function fetchTransactions() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log('Fetched Transactions:', data);

            if (response.ok && data.transactions) {
                updateTransactionList(data.transactions);
            } else {
                console.warn('No transactions found.');
                updateTransactionList([]);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not fetch transactions.');
        }
    }

    // Update Transaction List
    function updateTransactionList(transactions) {
        const transactionList = document.getElementById('transaction-list');
        transactionList.innerHTML = ''; // Clear current list

        if (!transactions || transactions.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.textContent = 'No transactions found.';
            transactionList.appendChild(emptyMsg);
            return;
        }

        transactions.forEach((transaction) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${transaction.name}: $${transaction.amount} (${transaction.type}) - ${transaction.category}
                <button class="edit-btn" data-id="${transaction._id}">Edit</button>
                <button class="delete-btn" data-id="${transaction._id}">Delete</button>
            `;
            transactionList.appendChild(li);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach((button) =>
            button.addEventListener('click', () => editTransaction(button.dataset.id))
        );

        document.querySelectorAll('.delete-btn').forEach((button) =>
            button.addEventListener('click', () => deleteTransaction(button.dataset.id))
        );
    }

    // Edit Transaction
    async function editTransaction(id) {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newName = prompt('Enter new name:');
        const newAmount = prompt('Enter new amount:');

        if (newName && newAmount) {
            try {
                const response = await fetch(`${API_URL}/transactions/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: newName, amount: parseFloat(newAmount) }),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Transaction updated successfully!');
                    fetchTransactions(); // Refresh transaction list
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Could not update transaction.');
            }
        }
    }

    // Delete Transaction
    async function deleteTransaction(id) {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                const response = await fetch(`${API_URL}/transactions/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    alert('Transaction deleted successfully!');
                    fetchTransactions(); // Refresh transaction list
                } else {
                    const data = await response.json();
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Could not delete transaction.');
            }
        }
    }

    // Show Dashboard
    function showDashboard() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        fetchTransactions(); // Fetch transactions for the logged-in user
    }

    // Clear Transaction Form
    function clearTransactionForm() {
        document.getElementById('transaction-name').value = '';
        document.getElementById('transaction-amount').value = '';
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token'); // Clear token
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    });
});
