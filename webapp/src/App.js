import React from 'react'
import './App.css'
import BasePage from './UsePages/BasePage'
import Chef from './UsePages/Chef'
import Waiter from './UsePages/Waiter'
import OrderDetails from './UsePages/OrderDetails'
import { Routes, Route } from 'react-router-dom'
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<BasePage />} />
        <Route path="/chef" element={<Chef />} />
        <Route path="/waiter" element={<Waiter />} />
        <Route path="/order/:id" element={<OrderDetails />} />
      </Routes>
    </div>
  );
}

export default App;