const mongoose = require('mongoose');

// Define a schema and model for your data
const MenuItemSchema = new mongoose.Schema({
	name: { type: String, required: true },
	quantity: { type: Number, required: true },
	price: { type: Number, required: true },
})

const orderSchema = new mongoose.Schema({
	customer_name: { type: String, required: true },
	items: [{ type: MenuItemSchema, required: true }],
	total_price: { type: Number, required: true },
	status: { type: String, required: true },
});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;