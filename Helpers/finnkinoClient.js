import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { XMLParser } from "fast-xml-parser";

puppeteer.use(StealthPlugin());

const FINNKINO_URL = "https://www.finnkino.fi/xml/";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
];

const parser = new XMLParser();

const pickRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

export const fetchFinnkinoXml = async (endpoint) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  let xmlText = "";

  try {
    await page.setUserAgent(pickRandomUserAgent());
    await page.goto(`${FINNKINO_URL}${endpoint}`, { waitUntil: "domcontentloaded" });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    xmlText = await page.evaluate(() => document.body.innerText);

    return parser.parse(xmlText);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw new Error(`Failed to fetch data from Finnkino API: ${error.message}`);
  } finally {
    if (xmlText) {
      console.log("Fetched XML:", xmlText.slice(0, 500));
    }
    await browser.close();
  }
};

export const fetchFinnkinoEventById = async (eventId) => {
  const data = await fetchFinnkinoXml(`Events/?eventID=${eventId}`);
  if (!data || !data.Events) {
    return null;
  }

  const { Event } = data.Events;
  if (!Event) {
    return null;
  }

  if (Array.isArray(Event)) {
    return Event[0];
  }

  return Event;
};
