import { pool } from "../Helpers/db.js"

// List all groups members
const selectAllGroupMembersByGroupId = async (group_id) => {
    return await pool.query('SELECT user_id FROM group_members WHERE group_id = $1 AND accepted = true', [group_id])
}

// List all groups the user is a member of
const selectAllGroupMembersByUserId = async (user_id) => {
    return await pool.query('SELECT g.id, g.group_name FROM group_members gm JOIN groups g ON gm.group_id = g.id WHERE gm.user_id = $1 AND gm.accepted = true', [user_id])
}

const updateGroupMemberAcceptedById = async (group_id, user_id) => {
    return await pool.query('UPDATE group_members SET accepted = true WHERE group_id = $1 AND user_id = $2 RETURNING *', [group_id, user_id])
}

const insertGroupMember = async (user_id, group_id, accepted) => {
    return await pool.query('INSERT INTO group_members (user_id, group_id, accepted) VALUES ($1, $2, $3) returning *', [user_id, group_id, accepted])
}

const deleteGroupMember = async (user_id, group_id) => {
    return await pool.query('DELETE FROM group_members WHERE user_id = $1 AND group_id = $2 returning *', [user_id, group_id])
}

export { selectAllGroupMembersByGroupId, selectAllGroupMembersByUserId, updateGroupMemberAcceptedById, insertGroupMember, deleteGroupMember }