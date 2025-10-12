import { pool } from "../Helpers/db.js"

// List all of group's showtimes
const selectAllGroupShowtimesByGroupId = async (group_id) => {
    return await pool.query(`
    SELECT 
      id,
      group_id,
      finnkino_db_id,
      area_id,
      dateOfShow,
      TO_CHAR(timeofshow, 'HH24:MI') AS timeofshow
    FROM group_showtimes
    WHERE group_id = $1
    ORDER BY dateOfShow DESC
  `, [group_id])
}

const insertGroupShowtime = async (group_id, finnkino_db_id, area_id, dateofshow, timeofshow) => {
    return await pool.query('INSERT INTO group_showtimes (group_id, finnkino_db_id, area_id, dateofshow, timeofshow) VALUES ($1, $2, $3, $4, $5) returning *', [group_id, finnkino_db_id, area_id, dateofshow, timeofshow])
}

const deleteGroupShowtime = async (group_id, showtime_id) => {
    return await pool.query('DELETE FROM group_showtimes WHERE group_id = $1 AND id = $2 returning *', [group_id, showtime_id])
}

export { selectAllGroupShowtimesByGroupId, insertGroupShowtime, deleteGroupShowtime }