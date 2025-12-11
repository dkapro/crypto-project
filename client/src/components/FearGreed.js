import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FearGreed = () => {
  const [fng, setFng] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/fng')
      .then(res => {
        setFng(res.data.data[0]);
      })
      .catch(err => console.error(err));
  }, []);

  if (!fng) return null; 

  const value = parseInt(fng.value);
  
  
  let color = '#f6465d'; 
  if (value >= 40) color = '#f7931a'; 
  if (value >= 60) color = '#0ecb81'; 

  return (
    <div className="fng-card">
      <h3>Market Sentiment</h3>
      
      <div className="fng-content">
        <div className="fng-circle" style={{ borderColor: color, color: color }}>
          {value}
        </div>
        
        <div className="fng-info">
          <p className="fng-label" style={{ color: color }}>
            {fng.value_classification}
          </p>
          <p className="fng-update">Updated: Just now</p>
        </div>
      </div>

     
      <div className="fng-bar-bg">
        <div 
          className="fng-bar-fill" 
          style={{ width: `${value}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

export default FearGreed;