import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import './Waiter.css';
import titleImage from '../Assets/Zen&Zest.png';

const Waiter = () => {
  const navigate = useNavigate();
  const items = [
    { name: 'Ramen', price: 100 },
    { name: 'Tanghulu', price: 55 },
    { name: 'Yasai Tempura', price: 60 },
    { name: 'Corn Dog', price: 90 },
    { name: 'Falooda', price: 70 },
    { name: 'Strawberry Boba', price: 80 },
    { name: 'Kiwi Boba', price: 80 },
    { name: 'Litchi Boba', price: 80 },
    { name: 'Passion Fruit Boba', price: 80 },
    { name: 'Ramen Add-on: Spicy Sauce', price: 5 },
    { name: 'Ramen Add-on: Paneer', price: 10 },
    { name: 'Boba Add-on: Blueberry Syrup', price: 0 },
    { name: 'Boba Add-on: Strawberry Syrup', price: 0 },
    { name: 'Boba Add-on: Kiwi Syrup', price: 0 },
  ];

  const [Qty, setQty] = useState(Array(items.length).fill(0));
  const [itemsSelected, setItemsSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [statusQueue, setStatusQueue] = useState([]);

  function decrement(index) {
    if (Qty[index] <= 0) return;
    setQty(previousQty => {
      previousQty[index] -= 1;
      return previousQty;
    });
    setItemsSelected(oldSelectedItems => {
      const newSelectedItems = [...oldSelectedItems];
      const indexToBeDeleted = newSelectedItems.findIndex(cursor => cursor.name === items[index].name
        && cursor.quantity === (Qty[index] + 1)
        && cursor.price === items[index].price);
      newSelectedItems.splice(indexToBeDeleted, 1);
      if (Qty[index] === 0) return [...newSelectedItems];
      else return [...newSelectedItems, { name: items[index].name, quantity: Qty[index], price: items[index].price }];
    });
  }

  function increment(index) {
    setQty(previousQty => {
      previousQty[index] += 1;
      return previousQty;
    });
    setItemsSelected(oldSelectedItems => {
      const newSelectedItems = [...oldSelectedItems];
      if (Qty[index] === 1)
        return [...newSelectedItems, { name: items[index].name, quantity: Qty[index], price: items[index].price }];
      else {
        const indexToBeDeleted = newSelectedItems.findIndex(cursor => cursor.name === items[index].name
          && cursor.quantity === (Qty[index] - 1)
          && cursor.price === items[index].price);
        newSelectedItems.splice(indexToBeDeleted, 1);
        return [...newSelectedItems, { name: items[index].name, quantity: Qty[index], price: items[index].price }];
      }
    });
  }

  function handleFinalize() {
    const total_price = [...itemsSelected].reduce((accummulator, curr) => accummulator + (curr.quantity * curr.price), 0);
    if (total_price <= 0) return alert("Please select items before finalizing order.");
    setShowModal(true);
  }

  async function submitOrder() {
    if (!customerName.trim()) return alert("Please enter a valid name.");

    try {
      const orderData = {
        customer_name: customerName,
        items: itemsSelected.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total_price: itemsSelected.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0),
        status: "Pending"
      };
      // Send POST request to the backend API
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URI}/item`, { ...orderData });

      if (/^20\d$/.test(response.status.toString())) {
        setQty(Array(items.length).fill(0));
        setItemsSelected([]);
        setCustomerName('');
        setShowModal(false);
        alert("Order successfully placed!");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to place order. Please try again.");
    }
  }

  async function getJobs() {
    try {
      // To get every order that hasn't been Delivered yet
      const PendingOrders = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/items?status=Pending`);
      const CookedOrders = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/items?status=Cooked`);
      let tempQ = [...CookedOrders.data, ...PendingOrders.data];
      setStatusQueue(tempQ);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }

  useEffect(() => {
    getJobs();
  }, [itemsSelected, Qty]);

  return (
    <div className="container">
      <nav className="navbar">
        <button className="navbar-brand" onClick={() => navigate('/')}>
          <img src={titleImage} width="300" height="80" alt="Zen & Zest" />
        </button>
      </nav>

      <div className="content">
        {/* Left section - Items Menu */}
        <div className="left-side">
          <div className="row menu g-3">
            <h3>Menu</h3>
            <div className="item-cards">
              {items.map((item, index) => (
                <Card className="col-auto item-card" key={item.id}>
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      <div>₹{item.price}</div>
                      <Button onClick={() => decrement(index)} variant="primary" size="sm">-</Button>
                      <span>{Qty[index]}</span>
                      <Button onClick={() => increment(index)} variant="secondary" size="sm">+</Button>
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
            <Button className="finalize justify-content-end" onClick={handleFinalize}>
              Finalize Order
            </Button>
          </div>
        </div>

        {/* Right section - Booked Orders */}
        <div className="right-side">
          <div className="finalized-orders">
            <h3>Booked Orders</h3>
            <table className="final-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {statusQueue.map(order => (
                  <tr key={order._id || order.id}>
                    <td>{order.customer_name}</td>
                    <td>₹{order.total_price}</td>
                    <td>
                      <Button onClick={() => navigate(`/order/${order._id || order.id}`)}>{order.status}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for customer details */}
      <Modal className='text-dark' show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Form>
          <div>
            <h5>Order Summary:</h5>
            <ul>
              {itemsSelected.map((item, idx) => (
                <li key={idx}>
                  {item.name} x {item.quantity} = ₹{item.quantity * item.price}
                </li>
              ))}
            </ul>
            <p><strong>Total: ₹{itemsSelected.reduce((acc, item) => acc + item.quantity * item.price, 0)}</strong></p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitOrder}>
            Place Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
};

export default Waiter;
