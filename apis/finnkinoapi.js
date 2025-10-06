import express from 'express';
import { fetchFinnkinoXml } from '../Helpers/finnkinoClient.js';

const finnkinoRouter = express.Router();

// haetaan teatterit
finnkinoRouter.get('/theatre-areas', async (req, res) => {
  try {
    const jsonData = await fetchFinnkinoXml('TheatreAreas')
    res.status(200).json(jsonData)
  } catch (error) {
    console.error('Error in /theatre-areas:', error)
    res.status(500).json({ error: error.message })
  }
});

// elokuvat tietyssä valitussa teatterissa
finnkinoRouter.get('/movies', async (req, res) => {
  const { areaId } = req.query
  if (!areaId) {
    return res.status(400).json({ error: 'areaId is required' })
  }

  try {
  const jsonData = await fetchFinnkinoXml(`Schedule/?area=${areaId}`)
    res.status(200).json(jsonData)
  } catch (error) {
    console.error('Error in /movies:', error)
    res.status(500).json({ error: error.message })
  }
})

// haetaan näytösajat
finnkinoRouter.get('/showtimes', async (req, res) => {
  const { areaId, date } = req.query
  if (!areaId || !date) {
    return res.status(400).json({ error: 'areaId and date are required' })
  }

  try {
  const jsonData = await fetchFinnkinoXml(`Schedule/?area=${areaId}&dt=${date}`)
    res.status(200).json(jsonData)
  } catch (error) {
    console.error('Error in /showtimes:', error)
    res.status(500).json({ error: error.message })
  }
})

export default finnkinoRouter;
