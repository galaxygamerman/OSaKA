import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import titleImage from '../Assets/Zen&Zest.png';
import './Chef.css'


const Chef = () => {  
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [reloadFlag, setReloadFlag] = useState(false);

  async function getJobs() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/items`);
      let tempQ = [...response.data].filter(data => data.status === 'Pending')
      setQueue(tempQ);
      return tempQ;
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }

  async function changeStatusToCooked(index) {
    const orderID = queue[index]._id;
    const newOrderData = {
      name: queue[index].name,
      items: queue[index].items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: queue[index].totalPrice,
      status: "Cooked"
    };
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URI}/item/${orderID}`, newOrderData);
      setReloadFlag(cur => !cur);
    } catch (error) {
      console.error("Error updating job:" + error);
    }
  }

  useEffect(() => {
    getJobs();
    return () => {
    }
  }, [reloadFlag]);  // Needed to only run once, else spams the mongodb with each rerender

  return (
    <>
      {/* Navbar at the top */}
      <nav className="navbar">
        <button className="navbar-brand" onClick={() => navigate('/')}>
          <img src={titleImage} width="300" height="80" alt="Zen & Zest" />
        </button>
      </nav>
      {/* Main content section */}
      <div className="container py-5">
        <h2 className="text-center mb-5 text-primary">Chef's Order Queue</h2>
        {queue.length > 0 ? (
          <div className="row g-3 justify-content-center">
            {queue.map((order, index) => (
              <div key={order.name} className="col-sm-12 col-md-auto">
                <div className="card h-100 shadow-sm shadow-lg">
                  <div className="card-body h-100">
                    <h3 className="card-title text-center mb-3 text-dark fw-bold">
                      {order.name}
                    </h3>
                    <div className="card-text">
                      <p className="fw-bold mb-2">Items:</p>
                      <ul className="list-group list-group-numbered mb-3">
                        {order.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="d-flex list-group-item bg-light justify-content-between">
                            <div className="justify-content-left">{item.name}</div>
                            <div className="justify-content-end">{item.quantity}</div>
                          </li>
                        ))}
                      </ul>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-primary rounded-pill fs-6">
                          ${order.totalPrice}
                        </span>
                        <button className="btn btn-success btn-sm" onClick={() => changeStatusToCooked(index)}>
                          Mark as Complete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">The cooking queue is empty.</p>
        )}
      </div>
    </>
  );
};

export default Chef;