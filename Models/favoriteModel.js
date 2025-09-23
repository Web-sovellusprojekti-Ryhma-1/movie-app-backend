import { pool } from "../Helpers/db.js"

// List all user's favorites
const selectAllFavoritesByUserId = async (user_id) => {
    return await pool.query('SELECT * FROM favorites WHERE user_id = $1', [user_id])
}

const insertUserFavorite = async (user_id, tmdb_id) => {
    return await pool.query('INSERT INTO favorites (user_id, tmdb_id) VALUES ($1, $2) returning *', [user_id, tmdb_id])
}

const deleteFavorite = async (user_id, tmdb_id) => {
    return await pool.query('DELETE FROM favorites WHERE user_id = $1 AND tmdb_id = $2 returning *', [user_id, tmdb_id])
}

export { selectAllFavoritesByUserId, insertUserFavorite, deleteFavorite }