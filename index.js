const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

// Store fetched numbers
let storedNumbers = [];
const windowSize = 10; // Set window size

// Mapping of number IDs to URLs
const apiUrls = {
  p: 'http://20.244.56.144/test/primes',
  f: 'http://20.244.56.144/test/fibo',
  e: 'http://20.244.56.144/test/even',
  r: 'http://20.244.56.144/test/rand',
};

// Middleware for JSON parsing
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Average Calculator API');
});

// Numbers route
app.get('/numbers/:id', async (req, res) => {
  const { id } = req.params;
  const url = apiUrls[id];

  if (!url) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  try {
    const prevState = [...storedNumbers];
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIzODczODQxLCJpYXQiOjE3MjM4NzM1NDEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA0ODc4ODk5LTljZWMtNDk3MS04MjBmLTZhZDA1YTM0ZjFhZSIsInN1YiI6InByaWp1aDIwMTAwM0BnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjA0ODc4ODk5LTljZWMtNDk3MS04MjBmLTZhZDA1YTM0ZjFhZSIsImNsaWVudFNlY3JldCI6IkZ6bUpiUURJSlRKZ0RFU1AiLCJvd25lck5hbWUiOiJwcmlqd2FsIiwib3duZXJFbWFpbCI6InByaWp1aDIwMTAwM0BnbWFpbC5jb20iLCJyb2xsTm8iOiIyMU4zMUEwNTgzIn0.6rBDpJSVnPLUeTaytHG82whwlloNGhqLT6Hgl8x8RBs`,
      },
      timeout: 500, // Set timeout to 500 ms
    });

    // Log raw response data for debugging
    console.log('Raw response data:', response.data);

    // Validate response format
    if (!response.data || !Array.isArray(response.data.numbers)) {
      throw new Error('Invalid response format');
    }

    const numbers = response.data.numbers;

    // Update stored numbers
    storedNumbers = [...storedNumbers, ...numbers].slice(-windowSize);

    // Calculate average
    const avg = storedNumbers.reduce((sum, num) => sum + num, 0) / storedNumbers.length;

    // Respond with the window state and average
    res.json({
      windowPrevState: prevState,
      windowCurrState: storedNumbers,
      numbers: numbers,
      avg: avg.toFixed(2),
    });

  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    res.status(500).json({ error: 'Failed to fetch numbers or process request' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
