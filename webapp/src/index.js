import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import './index.css';
import BasePage from './UsePages/BasePage';
import Chef from './UsePages/Chef';
import Waiter from './UsePages/Waiter';
import OrderDetails from './UsePages/OrderDetails';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<BasePage />} />
      <Route path="/chef" element={<Chef />} />
      <Route path="/waiter" element={<Waiter />} />
      <Route path="/order/:id" element={<OrderDetails />} />
    </Routes>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
