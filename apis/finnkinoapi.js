import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { XMLParser } from 'fast-xml-parser';

puppeteer.use(StealthPlugin());
const finnkinoRouter = express.Router();

const FINNKINO_URL = 'https://www.finnkino.fi/xml/';
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
];


async function fetchNConvToJSON(endpoint) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], 
  });
  const page = await browser.newPage()
  let xmlText = '';

  try {
    // käytetään tuommosta random userAgent listaa jotta voidaan huijata cloudflarea että ei tunnisteta botiksi
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]
    await page.setUserAgent(randomUserAgent)

    
    await page.goto(FINNKINO_URL + endpoint, { waitUntil: 'domcontentloaded' })

    // tärkein osa..
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // haetaan sivun sisältö ja muutetaan xml jsoniksi
    xmlText = await page.evaluate(() => document.body.innerText)
    const parser = new XMLParser()
    return parser.parse(xmlText)
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw new Error(`Failed to fetch data from Finnkino API: ${error.message}`)
  } finally {
    console.log('Fetched XML:', xmlText.slice(0, 500))
    await browser.close()
  }
}

// haetaan teatterit
finnkinoRouter.get('/theatre-areas', async (req, res) => {
  try {
    const jsonData = await fetchNConvToJSON('TheatreAreas')
    res.status(200).json(jsonData)
  } catch (error) {
    console.error('Error in /theatre-areas:', error)
    res.status(500).json({ error: error.message })
  }
});

// elokuvat tietyssä valitussa teatterissa
finnkinoRouter.get('/movies', async (req, res) => {
  const { areaId } = req.query;
  if (!areaId) {
    return res.status(400).json({ error: 'areaId is required' });
  }

  try {
    const jsonData = await fetchNConvToJSON(`Schedule/?area=${areaId}`);
    console.log('Movies API Response:', JSON.stringify(jsonData, null, 2)); // Debugging log

    const shows = jsonData.Schedule.Shows.Show.map((show) => {
      return {
        title: show.Title,
        showtime: show.dttmShowStart,
        length: show.LengthInMinutes,
        theatre: show.Theatre,
        image: show.Images?.EventMediumImagePortrait || null,
        genre: show.Genres || [],
        auditorium: show.TheatreAuditorium || null,
        rating: show.Rating || null,
        presentationMethod: show.PresentationMethod || null,
        language: show.Language || null,
      };
    });

    res.status(200).json({ shows });
  } catch (error) {
    console.error('Error in /movies:', error);
    res.status(500).json({ error: error.message });
  }
})

// haetaan näytösajat
finnkinoRouter.get('/showtimes', async (req, res) => {
  const { areaId, date } = req.query
  if (!areaId || !date) {
    return res.status(400).json({ error: 'areaId and date are required' })
  }

  try {
    const jsonData = await fetchNConvToJSON(`Schedule/?area=${areaId}&dt=${date}`)
    res.status(200).json(jsonData)
  } catch (error) {
    console.error('Error in /showtimes:', error)
    res.status(500).json({ error: error.message })
  }
})

export default finnkinoRouter;