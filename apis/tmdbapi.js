import express from "express";
//import fetch from "node-fetch";

const apirouter = express.Router()
const TMDB_BEARER = process.env.TMDB_BEARER // .env tiedostoon tmdb:ltä saatava bearer token

// elokuvien hakeminen hakusanalla +query+ ja page on useampaa tulosta varten mitä hakusanakenttää käytetään frontendissä
apirouter.get("/search", async (req, res) => {
  const { query, page } = req.query
  try {
    const resp = await fetch(
      'https://api.themoviedb.org/3/search/movie?query=' + query + '&include_adult=false&language=en-US&page=' + page,
      {
        headers: {
           Authorization: `Bearer ${TMDB_BEARER}` },
      }
    )
    const data = await resp.json()
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});

// haetaan elokuvien tiedot idn mukaan
apirouter.get("/movie/:id", async (req, res) => {
  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.id}?language=en-US&append_to_response=credits,videos`,
      {
        headers: { 
          Authorization: `Bearer ${TMDB_BEARER}` },
      }
    )
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default apirouter;

