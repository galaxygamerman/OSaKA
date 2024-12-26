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
	// console.log(req.body);

	let name = req.body.name;
	let items = req.body.items;
	let totalPrice = req.body.totalPrice;
	let status = req.body.status;

	try {
		const result1 = await pool.query('INSERT INTO customer_order (name, totalPrice, status) VALUES ($1,$2,$3) RETURNING *',
			[name, totalPrice, status]);
		let outputRows = result1.rows;
		// res.status(201).json(result1.rows);
		customer_order_id = result1.rows[0].id;
		console.log(outputRows);
		res.status(201).json(outputRows);
	} catch (error) {
		console.error("Error saving order", error);
		res.status(400).json({ message: error.message });
	}
});

// Start the server
app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));