import express from 'express';
//import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

const finnkinoRouter = express.Router();
const FINNKINO_URL = 'https://www.finnkino.fi/xml/'

// noudetaan api tiedot osoitteesta
//jos haluatte muokana niin endpoint on vaan parametri joka määrittelee mitä tietoa haetaan esim TheatreAreas tai joku muu apista XML tiedostosta
//vaihdoin DOMParserin fast-xml-parseriin
async function fetchNConvToJSON(endpoint) {
   try {
    const response = await fetch(FINNKINO_URL + endpoint)
    const xmlText = await response.text()

    const parser = new XMLParser()
    return parser.parse(xmlText)
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw new Error("Failed to fetch data from Finnkino API")
  }
}

finnkinoRouter.get("/theatre-areas", async (req, res) => {
  try {
    const jsonData = await fetchNConvToJSON("TheatreAreas")
    res.status(200).json(jsonData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// urlin endpoint jossa haetaan elokuvat kun teatteri on valittu
finnkinoRouter.get("/movies", async (req, res) => {
  const { areaId } = req.query;
  if (!areaId) {
    return res.status(400).json({ error: "areaId is required" });
  }

  try {
    const jsonData = await fetchNConvToJSON(`Schedule/?area=${areaId}`)
    res.status(200).json(jsonData) 
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

finnkinoRouter.get("/showtimes", async (req, res) => {
  const { areaId, date } = req.query
  if (!areaId || !date) {
    return res.status(400).json({ error: "areaId and date are required" })
  }

  try {
    const jsonData = await fetchNConvToJSON(`Schedule/?area=${areaId}&dt=${date}`)
    res.status(200).json(jsonData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default finnkinoRouter;