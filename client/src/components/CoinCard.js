import React from 'react';

const CoinCard = ({ name, symbol, price, image, priceChange }) => {
  
  const isPositive = priceChange >= 0;

  return (
    <div className="coin-card">
      <div className="card-header">
        <img src={image} alt={name} className="coin-logo" />
        <div>
          <h3>{name}</h3>
          <span className="coin-symbol">{symbol.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="card-body">
        <p className="coin-price">${price.toLocaleString()}</p>
        <p className={`coin-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {priceChange.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default CoinCard;