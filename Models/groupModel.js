import { pool } from "../Helpers/db.js"

const selectAllGroups = async () => {
    return await pool.query('SELECT * FROM groups')
}

const selectGroupById = async (id) => {
    return await pool.query('SELECT * FROM groups WHERE id = $1', [id])
}

const insertGroup = async (group_name, owner_id) => {
    return await pool.query('INSERT INTO groups (group_name, owner_id) VALUES ($1, $2) returning *', [group_name, owner_id])
}

const updateGroup = async (group_name, id) => {
    return await pool.query('UPDATE groups SET group_name = $1 WHERE id = $2 returning *', [group_name, id])
}

const deleteGroup = async (id) => {
    return await pool.query('DELETE FROM groups WHERE id = $1 returning *', [id])
}

export { selectAllGroups, selectGroupById, insertGroup, updateGroup, deleteGroup }