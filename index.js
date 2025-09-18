import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './Helpers/db.js'
import errorHandler from './Helpers/errorHandler.js'
import userRouter from './Routes/userRouter.js'
import apirouter from './apis/tmdbapi.js'

dotenv.config()

const port = process.env.PORT

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({result: "Success"})
})

app.use('/api', apirouter)

app.use('/', userRouter)

app.use(errorHandler)

// Test database connection
app.get("/db", async(req, res) => {
    const result = await pool.query("SELECT current_database()")
    res.send(`The database name is: ${result.rows[0].current_database}`)
})

// Server running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})