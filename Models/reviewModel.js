import { pool } from "../Helpers/db.js"

// List all user's reviews
const selectAllReviewsByUserId = async (user_id) => {
    return await pool.query('SELECT * FROM reviews WHERE user_id = $1', [user_id])
}

// List all movie's reviews
const selectAllReviewsByMovieId = async (tmdb_id) => {
    return await pool.query('SELECT * FROM reviews WHERE tmdb_id = $1', [tmdb_id])
}

const updateReview = async (user_id, tmdb_id, title, body, rating) => {
    return await pool.query('UPDATE reviews SET title = $1, body  = $2, rating = $3 WHERE user_id = $4 AND tmdb_id = $5 returning *', [title, body, rating, user_id, tmdb_id])
}

const insertReview = async (user_id, user_email, title, body, rating, tmdb_id) => {
    return await pool.query('INSERT INTO reviews (user_id, user_email, title, body, rating, tmdb_id) VALUES ($1, $2, $3, $4, $5, $6) returning *', [user_id, user_email, title, body, rating, tmdb_id])
}

const deleteReview = async (user_id, tmdb_id) => {
    return await pool.query('DELETE FROM reviews WHERE user_id = $1 AND tmdb_id = $2 returning *', [user_id, tmdb_id])
}

export { selectAllReviewsByUserId, selectAllReviewsByMovieId, updateReview, insertReview, deleteReview }