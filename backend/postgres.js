const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to PostgreSQL
const pool = new Pool({
	connectionString: process.env.POSTGRES_URI,
});

pool.connect()
	.then(() => console.log('Connected to PostgreSQL'))
	.catch(err => console.error('Error connecting to PostgreSQL:', err));

// CRUD Routes

// Create
app.post('/item', async (req, res) => {
	let name = req.body.name;
	let items = req.body.items;
	let total_price = req.body.total_price;
	let status = req.body.status;

	try {
		const result1 = await pool.query('INSERT INTO customer_order (name, total_price, status) VALUES ($1,$2,$3) RETURNING *',
			[name, total_price, status]);
		let outputRows = result1.rows;
		customer_order_id = result1.rows[0].id;

		for (const item of items) {
			const result2 = await pool.query('INSERT INTO chosen_item (order_id, name, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
				[customer_order_id, item.name, item.quantity, item.price]);
			outputRows.push(...result2.rows);
		}
		// console.log(outputRows);
		res.status(201).json(outputRows);
	} catch (error) {
		console.error("Error saving order", error);
		res.status(400).json({ message: error.message });
	}
});

// Read (all items)
app.get('/items', async (req, res) => {
	try {
		const query = req.query.status
			? 'SELECT * FROM customer_order WHERE status = $1'
			: 'SELECT * FROM customer_order';
		const values = req.query.status ? [req.query.status] : [];
		let orders = (await pool.query(query, values)).rows;
		orders = await Promise.all(orders.map(async order => {
			const item = await pool.query('SELECT * FROM chosen_item WHERE order_id = $1', [order.id]);
			order.items = item.rows; // Add items to the order
			return order; // Return the modified order
		}));
		res.status(200).json(orders);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Read (single item)
app.get('/item/:id', async (req, res) => {
	try {
		let order = (await pool.query('SELECT * FROM customer_order WHERE id = $1', [req.params.id])).rows[0];
		if (!order) return res.status(404).json({ message: 'Order not found' });
		const items = await pool.query('SELECT * FROM chosen_item WHERE order_id = $1', [order.id]);
		// console.log(items);
		order.items = items.rows;
		res.status(200).json(order);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update
app.put('/item/:id/:newState', async (req, res) => {
	try {
		const order = (await pool.query('UPDATE customer_order SET status = $1 WHERE id = $2 RETURNING *', [req.params.newState, req.params.id])).rows[0];

		if (!order) return res.status(404).json({ message: 'Order not found' });

		const items = await pool.query('SELECT * FROM chosen_item WHERE order_id = $1', [order.id]);
		order.items = items.rows; // Add items to the order
		res.status(200).json(order); // Return the updated order
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Delete
app.delete('/item/:id', async (req, res) => {
	try {
		const result = await pool.query('DELETE FROM customer_order WHERE id = $1 RETURNING *', [req.params.id]);
		if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
		res.json({ message: 'Order deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Start the server
app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));