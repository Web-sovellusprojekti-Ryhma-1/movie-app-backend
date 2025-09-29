import { pool } from "../Helpers/db.js"

// List all groups members
const selectAllGroupMembersByGroupId = async (group_id) => {
    return await pool.query('SELECT * FROM group_members WHERE group_id = $1', [group_id])
}

// List all groups the user is a member of
const selectAllGroupMembersByUserId = async (user_id) => {
    return await pool.query('SELECT * FROM group_members WHERE user_id = $1', [user_id])
}

const insertGroupMember = async (user_id, group_id, accepted) => {
    return await pool.query('INSERT INTO group_members (user_id, group_id, accepted) VALUES ($1, $2, $3) returning *', [user_id, group_id, accepted])
}

const deleteGroupMember = async (user_id, group_id) => {
    return await pool.query('DELETE FROM group_members WHERE user_id = $1 AND group_id = $2 returning *', [user_id, group_id])
}

export { selectAllGroupMembersByGroupId, selectAllGroupMembersByUserId, insertGroupMember, deleteGroupMember }