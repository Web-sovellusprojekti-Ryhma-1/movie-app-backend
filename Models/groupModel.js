import { pool } from "../Helpers/db.js"

const insertGroup = async (group_name, owner_id) => {
    return await pool.query('INSERT INTO groups (group_name, owner_id) VALUES ($1, $2) returning *', [group_name, owner_id])
}

const deleteGroup = async (group_id) => {
    return await pool.query('DELETE FROM groups WHERE group_id = $1 returning *', [group_id])
}

export { insertGroup, deleteGroup }