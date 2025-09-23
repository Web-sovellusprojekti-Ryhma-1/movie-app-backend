import { pool } from "../Helpers/db.js"

const insertGroupMember = async (user_id, group_id, accepted) => {
    return await pool.query('INSERT INTO group_members (user_id, group_id, accepted) VALUES ($1, $2, $3) returning *', [user_id, group_id, accepted])
}

const deleteGroupMember = async (user_id, group_id) => {
    return await pool.query('DELETE FROM group_members WHERE user_id = $1 AND group_id = $2 returning *', [user_id, group_id])
}

export { insertGroupMember, deleteGroupMember }