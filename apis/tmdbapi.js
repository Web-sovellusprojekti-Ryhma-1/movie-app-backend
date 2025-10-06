import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

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


let cachedGenres = null // cachaaminen vissiin vähentää api kutsuja myös vaihtoehto finnkinoon testiksi jos meinaa herjata taas bottina tomimisesta

const fetchGenres = async () => {
  if (cachedGenres) {
    return cachedGenres;
  }
  try {
    const resp = await fetch(
      "https://api.themoviedb.org/3/genre/movie/list?language=en-US",
      {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER}`,
        },
      }
    );
    const data = await resp.json()
    cachedGenres = data.genres; 
    return data.genres;
  } catch (err) {
    console.error("Error fetching genres from TMDB:", err);
    throw err;
  }
};

// haetaan elokuvien tiedot idn mukaan
apirouter.get("/movie/:id", async (req, res) => {
  const movieId = req.params.id;
  console.log("Fetching movie details for ID:", movieId); // debuggausta varten jotta nähdään elokuvan id ja että se sopii frontendiin
  try {
    const [movieResp, genres] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&append_to_response=credits,videos`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_BEARER}`,
          },
        }
      ).then((resp) => resp.json()),
      fetchGenres(),
    ]);

    if (!movieResp || movieResp.success === false) {
      console.error("Error fetching movie details:", movieResp);
      return res.status(500).json({ error: "Failed to fetch movie details." })
    }

    // genrejen mappaus id -> nimi
    const movieGenres = movieResp.genres?.map((g) => g.name) || []

    res.json({
      ...movieResp,
      genres: movieGenres,
      allGenres: genres, 
    });
  } catch (err) {
    console.error("Error fetching movie details from TMDB:", err)
    res.status(500).json({ error: err.message })
  }
})

// route genreille frontendiin
apirouter.get("/genres", async (req, res) => {
  try {
    const genres = await fetchGenres()
    res.json({ genres })
  } catch (err) {
    console.error("Error fetching genres:", err)
    res.status(500).json({ error: "Failed to fetch genres." })
  }
})

// suositut elokuvat tmdbn mukaan
apirouter.get("/popular", async (req, res) => {
  try {
    const resp = await fetch(
      "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
      {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER}`,
        },
      }
    );
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching popular movies from TMDB:", err);
    res.status(500).json({ error: "Failed to fetch popular movies." });
  }
});

export default apirouter;

