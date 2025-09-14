import { pool } from "../Helpers/db.js"

const selectAllUsers = async () => {
    return await pool.query('SELECT * FROM users')
}

const selectUserById = async (id) => {
    return await pool.query('SELECT * FROM users WHERE id = $1', [id])
}

const selectUserByEmail = async (email) => {
    return await pool.query('SELECT * FROM users WHERE email = $1', [email])
}

const insertUser = async (username, email, password) => {
    return await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) returning *', [username, email, password])
}

const deleteUserByEmail = async (email) => {
    return await pool.query('DELETE FROM users WHERE email = $1 returning *', [email])
}

export { selectAllUsers, selectUserById, selectUserByEmail, insertUser, deleteUserByEmail }