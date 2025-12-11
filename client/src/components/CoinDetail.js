import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CoinDetail = () => {
  const { id } = useParams(); 
  const [history, setHistory] = useState([]);
  const [analyzedNews, setAnalyzedNews] = useState([]);

  
  const analyzeSentiment = (title) => {
    const positive = ['up', 'buy', 'bull', 'high', 'growth', 'launch', 'profit', 'partnership'];
    const negative = ['down', 'sell', 'bear', 'crash', 'drop', 'ban', 'loss', 'regulation'];
    
    const lowerTitle = title.toLowerCase();
    let score = 0;
    positive.forEach(word => { if (lowerTitle.includes(word)) score++; });
    negative.forEach(word => { if (lowerTitle.includes(word)) score--; });

    if (score > 0) return { label: 'BULLISH', color: '#0ecb81' };
    if (score < 0) return { label: 'BEARISH', color: '#f6465d' };
    return { label: 'NEUTRAL', color: '#888' };
  };

  useEffect(() => {
    
    axios.get(`http://localhost:5000/api/coins/${id}/history`)
      .then(res => {
        const formattedData = res.data.map(item => ({
          
          date: new Date(item[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
          price: item[1]
        }));
        setHistory(formattedData);
      })
      .catch(err => console.error("error graph:", err));

   
    const fakeNews = [
      `Analysts predict ${id} price hitting new highs soon`,
      `Market crash: panic selling affects ${id}`,
      `${id} announces major partnership with tech giant`,
      `Regulatory concerns grow around ${id} trading`
    ];

    const results = fakeNews.map(news => ({
      title: news,
      sentiment: analyzeSentiment(news)
    }));
    setAnalyzedNews(results);

  }, [id]);

  return (
    <div className="coin-detail" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/" className="back-btn">← Back to Dashboard</Link>
      
      <h1 style={{ marginTop: '20px', textTransform: 'capitalize' }}>
        {id} Market Analysis
      </h1>

     
      <div className="chart-container" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '15px', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px' }}>7-Day Price Trend (USD)</h3>
        
      
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={history}>
              <XAxis dataKey="date" stroke="#888" tick={{fill: '#888'}} />
              
              <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fill: '#888'}} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
                labelStyle={{ color: '#888' }}
              />
              <Line type="monotone" dataKey="price" stroke="#f7931a" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
        

      
      <div className="news-container">
        <h3>AI Sentiment Analysis</h3>
        <div className="news-grid">
          {analyzedNews.map((item, index) => (
            <div key={index} className="news-card" style={{ borderLeft: `5px solid ${item.sentiment.color}` }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{item.title}</p>
              <span style={{ color: item.sentiment.color, fontWeight: 'bold', textTransform: 'uppercase' }}>
                {item.sentiment.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;