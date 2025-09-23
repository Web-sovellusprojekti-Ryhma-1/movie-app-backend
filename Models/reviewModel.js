import { pool } from "../Helpers/db.js"

const insertReview = async (user_id, title, body, rating, tmdb_id) => {
    return await pool.query('INSERT INTO reviews (user_id, title, body, rating, tmdb_id) VALUES ($1, $2, $3, $4, $5) returning *', [user_id, title, body, rating, tmdb_id])
}

const deleteReview = async (user_id, tmdb_id) => {
    return await pool.query('DELETE FROM reviews WHERE user_id = $1 AND tmdb_id = $2 returning *', [user_id, tmdb_id])
}

export { insertReview, deleteReview }