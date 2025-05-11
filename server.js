// import express from 'express';
// import fetch from 'node-fetch'; // works now as ESM
// import cors from 'cors';
// const app = express();
// const PORT = process.env.PORT || 3000;
// app.use(cors());
// const cache = {};
// // app.get('/api/forecast', async (req, res) => {
// //   const { lat, lon, days } = req.query;

// //   if (!lat || !lon || !days) {
// //     return res.status(400).json({ error: "Missing lat, lon or days" });
// //   }

// //   const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&forecast_days=${days}&timezone=auto`;

// //   try {
// //     const response = await fetch(url);
// //     const data = await response.json();
// //     res.json(data);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "API request failed" });
// //   }
// // });

// app.get('/api/forecast', async (req, res) => {
//   const { lat, lon, days } = req.query;

//   if (!lat || !lon || !days) {
//     return res.status(400).json({ error: "Missing lat, lon or days" });
//   }

//   const today = new Date().toISOString().split('T')[0];
//   const cacheKey = `${lat}_${lon}_${days}_${today}`;

//   if (cache[cacheKey]) {
//     return res.json({
//       source: "cache",
//       message: "Data served from cache",
//       data: cache[cacheKey]
//     });
//   }

//   const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&forecast_days=${days}&timezone=auto`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     cache[cacheKey] = data;

//     res.json({
//       source: "api",
//       message: "Data fetched hybrid lstm",
//       data: data
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "API request failed" });
//   }
// });


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const cache = {};
const WEATHERAPI_KEY = 'a74c0cedfbd5479e8a4162717251105';

app.get('/api/forecast', async (req, res) => {
  const { lat, lon, days } = req.query;

  // Check if lat, lon, and days are provided
  if (!lat || !lon || !days) {
    return res.status(400).json({ error: "Missing lat, lon or days" });
  }

  // Ensure the number of days does not exceed the free tier limit (max 3 days)
  if (days > 3) {
    return res.status(400).json({ error: "Frecast limit reached" });
  }

  // Use today's date to create a cache key
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${lat}_${lon}_${days}_${today}`;

  // Check if the data for this cache key is already stored
  if (cache[cacheKey]) {
    return res.json({
      source: "cache",
      message: "Max temperature served from cache",
      data: cache[cacheKey]
    });
  }

  // API URL for fetching the weather data
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`;

  try {
    const response = await fetch(url);
    const rawData = await response.json();

    // Handle any errors returned by the WeatherAPI
    if (rawData.error) {
      return res.status(500).json({ error: rawData.error.message });
    }

    // Extract the forecast data (date and max temperature)
    const forecast = rawData.forecast.forecastday.map(day => ({
      date: day.date,
      maxtemp_c: day.day.maxtemp_c
    }));

    // Cache the forecast data for future requests
    cache[cacheKey] = forecast;

    // Send response with fetched data
    res.json({
      source: "api",
      message: "Max temperature fetched from WeatherAPI",
      data: forecast
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
