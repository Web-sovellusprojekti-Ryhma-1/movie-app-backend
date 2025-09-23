import { pool } from "../Helpers/db.js"

const insertGroupShowtime = async (group_id, finnkino_db_id, area_id, dateofshow) => {
    return await pool.query('INSERT INTO group_showtimes (group_id, finnkino_db_id, area_id, dateofshow) VALUES ($1, $2, $3, $4) returning *', [group_id, finnkino_db_id, area_id, dateofshow])
}

const deleteGroupShowtime = async (showtime_id) => {
    return await pool.query('DELETE FROM group_showtimes WHERE showtime_id = $1 returning *', [showtime_id])
}

export { insertGroupShowtime, deleteGroupShowtime }