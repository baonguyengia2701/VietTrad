const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoint to check if server is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Debug endpoint to check token parsing
app.post('/debug-token', (req, res) => {
  console.log('=== DEBUG TOKEN ===');
  console.log('Headers:', req.headers);
  console.log('Authorization header:', req.headers.authorization);
  console.log('Body:', req.body);
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token);
    res.json({
      success: true,
      message: 'Token received successfully',
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
    });
  } else {
    console.log('No valid authorization header found');
    res.status(401).json({
      success: false,
      message: 'No authorization header or invalid format',
      receivedHeader: authHeader
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🔍 Debug server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Debug token endpoint: http://localhost:${PORT}/debug-token`);
}); 