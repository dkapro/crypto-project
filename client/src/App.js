import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CoinCard from './components/CoinCard';
import CoinDetail from './components/CoinDetail';
import FearGreed from './components/FearGreed';

function Home() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/coins')
      .then(response => setCoins(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="app-container">
      <h1>Crypto Tracker</h1>
      <FearGreed />
      <div className="coin-grid">
        {coins.map(coin => (
          <Link to={`/coin/${coin.id}`} key={coin.id} style={{ textDecoration: 'none' }}>
            <CoinCard 
              name={coin.name}
              symbol={coin.symbol}
              price={coin.current_price}
              image={coin.image}
              priceChange={coin.price_change_percentage_24h}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coin/:id" element={<CoinDetail />} />
      </Routes>
    </Router>
  );
}

export default App;