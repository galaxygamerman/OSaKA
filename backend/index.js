const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Order = require('./models/orders.js')
const dotenv = require('dotenv')
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONN_URI)
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error('Error connecting to MongoDB:', err));

// CRUD Routes

// Create
app.post('/item', async (req, res) => {
	try {
		const newOrder = new Order(req.body);
		const savedItem = await newOrder.save();
		res.status(201).json(savedItem);
	} catch (error) {
		console.error("Error saving order", error);
		res.status(400).json({ message: error.message });
	}
});

// Read (all items)
app.get('/items', async (req, res) => {
	try {
		const orders = await Order.find();
		res.json(orders);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Read (single item)
app.get('/item/:id', async (req, res) => {
	try {
		const foundOrder = await Order.findById(req.params.id);
		if (!foundOrder) return res.status(404).json({ message: 'Order not found' });
		res.json(foundOrder);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update
app.put('/item/:id', async (req, res) => {
	try {
		const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
		res.json(updatedOrder);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Delete
app.delete('/item/:id', async (req, res) => {
	try {
		const deletedOrder = await Order.findByIdAndDelete(req.params.id);
		if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
		res.json({ message: 'Order deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Start the server
app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));