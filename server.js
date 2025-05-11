import express from 'express';
import fetch from 'node-fetch'; // works now as ESM
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.get('/api/forecast', async (req, res) => {
  const { lat, lon, days } = req.query;

  if (!lat || !lon || !days) {
    return res.status(400).json({ error: "Missing lat, lon or days" });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&forecast_days=${days}&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
