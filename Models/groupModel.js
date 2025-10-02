import { pool } from "../Helpers/db.js"

const selectGroupById = async (id) => {
    return await pool.query('SELECT * FROM groups WHERE id = $1', [id])
}

const insertGroup = async (group_name, owner_id) => {
    return await pool.query('INSERT INTO groups (group_name, owner_id) VALUES ($1, $2) returning *', [group_name, owner_id])
}

const deleteGroup = async (id) => {
    return await pool.query('DELETE FROM groups WHERE id = $1 returning *', [id])
}

export { selectGroupById, insertGroup, deleteGroup }