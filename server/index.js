const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

let cacheData = null;      
let lastFetchTime = 0;      

let historyCache = {};      
let historyTimestamps = {}; 




const BACKUP_COINS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 94500, price_change_percentage_24h: 2.5, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3200, price_change_percentage_24h: -1.2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
];

const generateBackupHistory = () => {
  const data = [];
  const now = Date.now();
  let price = 50000;
  for (let i = 7; i >= 0; i--) {
    price = price * (1 + (Math.random() * 0.1 - 0.05));
    data.push([now - (i * 24 * 60 * 60 * 1000), price]);
  }
  return data;
};


app.get('/api/coins', async (req, res) => {
  const now = Date.now();

  
  if (cacheData && (now - lastFetchTime < 60000)) {
    console.log("Serving from CACHE (No API call)");
    return res.json(cacheData);
  }

  try {
    console.log("Fetching new data from CoinGecko...");
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets', 
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false
        }
      }
    );
    
   
    cacheData = response.data;
    lastFetchTime = now;
    
    res.json(response.data);
  } catch (error) {
    console.warn("API Error. Using BACKUP data.");
  
    if (cacheData) return res.json(cacheData);
    res.json(BACKUP_COINS);
  }
});


app.get('/api/coins/:id/history', async (req, res) => {
  const { id } = req.params;
  const now = Date.now();

  
  if (historyCache[id] && (now - historyTimestamps[id] < 60000)) {
    console.log(`Serving History from CACHE for ${id}`);
    return res.json(historyCache[id]);
  }

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: '7',
          interval: 'daily' 
        }
      }
    );
    
   
    historyCache[id] = response.data.prices;
    historyTimestamps[id] = now;

    res.json(response.data.prices);
  } catch (error) {
    console.warn(`API Error for ${id}. Sending fake history.`);
    if (historyCache[id]) return res.json(historyCache[id]);
    res.json(generateBackupHistory());
  }
});

app.get('/api/fng', async (req, res) => {
  try {
    const response = await axios.get('https://api.alternative.me/fng/');
    res.json(response.data);
  } catch (error) {
    console.error("FNG API Error:", error.message);
    res.status(500).json({ error: 'Failed to fetch Fear & Greed Index' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});