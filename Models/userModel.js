import { pool } from "../Helpers/db.js"

const selectAllUsers = async () => {
    return await pool.query('SELECT * FROM users')
}

const insertUsers = async (username, email, password) => {
    return await pool.query('insert into users (username, email, password) values ($1, $2, $3) returning *', [username, email, password])
}

export { selectAllUsers, insertUsers }